package com.itsm.asset.service;

import com.itsm.asset.dto.request.CatalogItemRequest;
import com.itsm.asset.dto.request.ServiceRequestRequest;
import com.itsm.asset.entity.ServiceCatalogItem;
import com.itsm.asset.entity.ServiceRequest;
import com.itsm.asset.enums.ServiceRequestStatus;

import java.util.List;

public interface ServiceCatalogService {
    List<ServiceCatalogItem> getActiveCatalog();
    ServiceCatalogItem getCatalogItemById(Long id);
    ServiceCatalogItem createCatalogItem(CatalogItemRequest request);
    ServiceCatalogItem updateCatalogItem(Long id, CatalogItemRequest request);
    void deactivateCatalogItem(Long id);

    ServiceRequest submitRequest(ServiceRequestRequest request, Long requesterID);
    ServiceRequest getRequestById(Long id);
    List<ServiceRequest> getMyRequests(Long requesterID);
    List<ServiceRequest> getAllRequests();
    ServiceRequest updateRequestStatus(Long id, ServiceRequestStatus status, Long assignedToID);
    ServiceRequest updateRequestStatus(Long id, ServiceRequestStatus status, Long assignedToID, String remark);
}
