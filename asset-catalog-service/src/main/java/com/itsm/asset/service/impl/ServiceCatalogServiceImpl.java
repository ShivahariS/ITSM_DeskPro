package com.itsm.asset.service.impl;

import com.itsm.asset.client.UserDirectoryClient;
import com.itsm.asset.dto.request.CatalogItemRequest;
import com.itsm.asset.dto.request.ServiceRequestRequest;
import com.itsm.asset.entity.ServiceCatalogItem;
import com.itsm.asset.entity.ServiceRequest;
import com.itsm.asset.enums.ServiceRequestStatus;
import com.itsm.asset.enums.NotificationCategory;
import com.itsm.asset.exception.ResourceNotFoundException;
import com.itsm.asset.client.NotificationServiceClient;
import com.itsm.asset.repository.ServiceCatalogItemRepository;
import com.itsm.asset.repository.ServiceRequestRepository;
import com.itsm.asset.service.ServiceCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceCatalogServiceImpl implements ServiceCatalogService {

    private final ServiceCatalogItemRepository catalogRepo;
    private final ServiceRequestRepository requestRepo;
    private final NotificationServiceClient notificationService;
    private final UserDirectoryClient userDirectoryClient;

    @Override
    public List<ServiceCatalogItem> getActiveCatalog() {
        return catalogRepo.findByActiveTrue();
    }

    @Override
    public ServiceCatalogItem getCatalogItemById(Long id) {
        return catalogRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catalog item not found: " + id));
    }

    @Override
    public ServiceCatalogItem createCatalogItem(CatalogItemRequest req) {
        return catalogRepo.save(ServiceCatalogItem.builder()
                .serviceName(req.serviceName())
                .category(req.category())
                .description(req.description())
                .fulfilmentSLAHours(req.fulfilmentSLAHours())
                .approvalRequired(req.approvalRequired() != null ? req.approvalRequired() : false)
                .deliveryTeamID(req.deliveryTeamID())
                .build());
    }

    @Override
    public ServiceCatalogItem updateCatalogItem(Long id, CatalogItemRequest req) {
        ServiceCatalogItem item = getCatalogItemById(id);
        item.setServiceName(req.serviceName());
        item.setCategory(req.category());
        item.setDescription(req.description());
        item.setFulfilmentSLAHours(req.fulfilmentSLAHours());
        if (req.approvalRequired() != null) item.setApprovalRequired(req.approvalRequired());
        item.setDeliveryTeamID(req.deliveryTeamID());
        return catalogRepo.save(item);
    }

    @Override
    public void deactivateCatalogItem(Long id) {
        ServiceCatalogItem item = getCatalogItemById(id);
        item.setActive(false);
        catalogRepo.save(item);
    }

    @Override
    public ServiceRequest submitRequest(ServiceRequestRequest req, Long requesterID) {
        ServiceCatalogItem item = getCatalogItemById(req.catalogItemID());
        LocalDateTime dueDate = item.getFulfilmentSLAHours() != null
                ? LocalDateTime.now().plusHours(item.getFulfilmentSLAHours()) : null;
        ServiceRequestStatus initStatus = Boolean.TRUE.equals(item.getApprovalRequired())
                ? ServiceRequestStatus.PENDING_APPROVAL : ServiceRequestStatus.SUBMITTED;
        ServiceRequest saved = requestRepo.save(ServiceRequest.builder()
                .requesterID(requesterID)
                .catalogItemID(req.catalogItemID())
                .details(req.details())
                .fulfilmentDueDate(dueDate)
                .status(initStatus)
                .build());

        String itemName = item.getServiceName() != null ? item.getServiceName().toLowerCase() : "";
        boolean isMatchedItem = itemName.contains("laptop") || itemName.contains("license") || itemName.contains("id card") || itemName.contains("access refresh") || itemName.contains("password");
        if (isMatchedItem) {
            List<Long> l1UserIds = userDirectoryClient.findUserIdsByRole("L1_SUPPORT");
            for (Long l1Id : l1UserIds) {
                notificationService.createNotification(l1Id, "User with ID " + requesterID + " has submitted a request.", NotificationCategory.SERVICE_REQUEST);
            }
        }
        return saved;
    }

    @Override
    public ServiceRequest getRequestById(Long id) {
        return requestRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + id));
    }

    @Override
    public List<ServiceRequest> getMyRequests(Long requesterID) {
        return requestRepo.findByRequesterID(requesterID);
    }

    @Override
    public List<ServiceRequest> getAllRequests() {
        return requestRepo.findAll();
    }

    @Override
    public ServiceRequest updateRequestStatus(Long id, ServiceRequestStatus status, Long assignedToID, String remark) {
        ServiceRequest req = getRequestById(id);
        ServiceRequestStatus oldStatus = req.getStatus();
        req.setStatus(status);
        if (assignedToID != null) req.setAssignedToID(assignedToID);
        ServiceRequest saved = requestRepo.save(req);

        ServiceCatalogItem item = null;
        if (req.getCatalogItemID() != null) {
            try {
                item = getCatalogItemById(req.getCatalogItemID());
            } catch (Exception ignored) {}
        }
        String itemName = (item != null && item.getServiceName() != null) ? item.getServiceName().toLowerCase() : "";

        boolean isLaptop = itemName.contains("laptop");
        boolean isLicense = itemName.contains("license");
        boolean isIdCard = itemName.contains("id card");
        boolean isAccessRefresh = itemName.contains("access refresh");
        boolean isPasswordReset = itemName.contains("password");

        if (assignedToID != null && !assignedToID.equals(req.getRequesterID())) {
            notificationService.createNotification(assignedToID, "Service request SRQ-" + id + " has been assigned to you.", NotificationCategory.SERVICE_REQUEST);
        }

        if (oldStatus == ServiceRequestStatus.PENDING_APPROVAL || oldStatus == ServiceRequestStatus.SUBMITTED) {
            if (status == ServiceRequestStatus.IN_PROGRESS) {
                if (isLaptop || isLicense || isIdCard) {
                    notificationService.createNotification(req.getRequesterID(), "Your request has been approved.", NotificationCategory.SERVICE_REQUEST);
                }
            } else if (status == ServiceRequestStatus.REJECTED) {
                if (isIdCard) {
                    notificationService.createNotification(req.getRequesterID(), "Your request has been rejected.", NotificationCategory.SERVICE_REQUEST);
                }
            }
        }

        if (oldStatus == ServiceRequestStatus.IN_PROGRESS && status == ServiceRequestStatus.SUBMITTED) {
            // Caller's role now comes from the JWT (set as a Spring Security authority),
            // since this service no longer owns the User entity.
            boolean callerIsAssetManager = false;
            try {
                org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) {
                    callerIsAssetManager = auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ASSET_MANAGER"));
                }
            } catch (Exception ignored) {}

            if (isLaptop || isLicense) {
                List<Long> l1UserIds = userDirectoryClient.findUserIdsByRole("L1_SUPPORT");
                String msg;
                if (remark != null && !remark.trim().isEmpty()) {
                    msg = "the request has been rejected by the asset manager.";
                } else {
                    msg = "request with ID " + id + " has been resolved";
                }
                for (Long l1Id : l1UserIds) {
                    notificationService.createNotification(l1Id, msg, NotificationCategory.SERVICE_REQUEST);
                }
            } else if (isIdCard) {
                if (callerIsAssetManager) {
                    List<Long> l1UserIds = userDirectoryClient.findUserIdsByRole("L1_SUPPORT");
                    for (Long l1Id : l1UserIds) {
                        notificationService.createNotification(l1Id, "request with ID " + id + " has been resolved", NotificationCategory.SERVICE_REQUEST);
                    }
                }
            }
        }

        if (status == ServiceRequestStatus.FULFILLED) {
            if (isLaptop) {
                notificationService.createNotification(req.getRequesterID(), "Your request for laptop has been completed, and should collect their asset at the Asset Requisition Desk.", NotificationCategory.SERVICE_REQUEST);
            } else if (isLicense) {
                notificationService.createNotification(req.getRequesterID(), "Your request for the license has been accepted and the license has been activated.", NotificationCategory.SERVICE_REQUEST);
            } else if (isIdCard) {
                notificationService.createNotification(req.getRequesterID(), "Your request has been fulfilled and the asset can be collected at the asset requisition desk.", NotificationCategory.SERVICE_REQUEST);
            } else if (isAccessRefresh) {
                notificationService.createNotification(req.getRequesterID(), "Your request for Access refresh has been fulfilled.", NotificationCategory.SERVICE_REQUEST);
            } else if (isPasswordReset) {
                notificationService.createNotification(req.getRequesterID(), "you request to change password has been approved", NotificationCategory.SERVICE_REQUEST);
            } else {
                notificationService.createNotification(req.getRequesterID(), "Your service request SRQ-" + id + " has been fulfilled.", NotificationCategory.SERVICE_REQUEST);
            }
        } else if (status == ServiceRequestStatus.REJECTED) {
            if (isLaptop) {
                notificationService.createNotification(req.getRequesterID(), "Your request for laptop has been rejected.", NotificationCategory.SERVICE_REQUEST);
            } else if (isLicense) {
                notificationService.createNotification(req.getRequesterID(), "The request has been rejected.", NotificationCategory.SERVICE_REQUEST);
            } else {
                notificationService.createNotification(req.getRequesterID(), "Your service request SRQ-" + id + " has been rejected.", NotificationCategory.SERVICE_REQUEST);
            }
        }

        return saved;
    }

    @Override
    public ServiceRequest updateRequestStatus(Long id, ServiceRequestStatus status, Long assignedToID) {
        return updateRequestStatus(id, status, assignedToID, null);
    }
}
