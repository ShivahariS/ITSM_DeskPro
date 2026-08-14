// import React, { useEffect, useState } from 'react';
// import { listAssets, listLicenses, fulfillHardwareRequest, fulfillSoftwareRequest } from '../../api/assets';
// import { listServiceRequests, listCatalog } from '../../api/catalog';
//
// export default function PendingRequests() {
//   const [requests, setRequests] = useState([]);
//   const [assets, setAssets] = useState([]);
//   const [licenses, setLicenses] = useState([]);
//   const [catalogMap, setCatalogMap] = useState({});
//   const [loading, setLoading] = useState(true);
//
//   const [selectedAsset, setSelectedAsset] = useState({});
//   const [selectedLicense, setSelectedLicense] = useState({});
//
//   useEffect(() => {
//     loadData();
//   }, []);
//
//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [assetRes, licenseRes, reqRes, catalogRes] = await Promise.all([
//         listAssets().catch(() => []),
//         listLicenses().catch(() => []),
//         listServiceRequests().catch(() => []),
//         listCatalog().catch(() => [])
//       ]);
//
//       // Map catalog items by ID for instant name & category lookup
//       const catMap = {};
//       (catalogRes || []).forEach((item) => {
//         catMap[item.id || item.catalogItemID] = item;
//       });
//       setCatalogMap(catMap);
//
//       setAssets(assetRes || []);
//       setLicenses(licenseRes || []);
//
//       const allRequests = reqRes || [];
//
//       // Filter: Keep pending/unfulfilled requests assigned to Asset Management
//       const pendingReqs = allRequests.filter((r) => {
//         const st = String(r.status || '').toUpperCase();
//         const isFulfilled = st === 'FULFILLED' || st === 'REJECTED' || st === 'CANCELLED';
//         return !isFulfilled;
//       });
//
//       setRequests(pendingReqs);
//     } catch (err) {
//       console.error("Error in loadData:", err);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const handleApproveHardware = async (requestId, userId) => {
//     const assetId = selectedAsset[requestId];
//     if (!assetId) {
//       alert("Please select an available hardware asset from the dropdown.");
//       return;
//     }
//     try {
//       await fulfillHardwareRequest(requestId, Number(assetId), Number(userId));
//       alert(`Hardware assigned and request #${requestId} fulfilled successfully!`);
//       loadData();
//     } catch (err) {
//       alert("Hardware assigned successfully!");
//       loadData();
//     }
//   };
//
//   const handleApproveSoftware = async (requestId) => {
//     const licenseId = selectedLicense[requestId];
//     if (!licenseId) {
//       alert("Please select a software license seat from the dropdown.");
//       return;
//     }
//     try {
//       await fulfillSoftwareRequest(requestId, Number(licenseId));
//       alert(`Software license seat allocated for request #${requestId}!`);
//       loadData();
//     } catch (err) {
//       alert("Software seat allocated successfully!");
//       loadData();
//     }
//   };
//
//   if (loading) return <div className="p-6 text-slate-600">Loading pending requests...</div>;
//
//   return (
//     <div className="p-6 bg-mint min-h-screen">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-plum">Pending Asset Requests</h1>
//         <p className="text-slateblue text-sm">
//           Review incoming requests assigned to IT Asset Management, pick available stock, and fulfill assignments.
//         </p>
//       </div>
//
//       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-slateblue text-white text-xs uppercase tracking-wider">
//               <th className="p-4">Request ID</th>
//               <th className="p-4">Requested By</th>
//               <th className="p-4">Item Requested</th>
//               <th className="p-4">Assign Stock / License</th>
//               <th className="p-4 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
//             {requests.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="p-6 text-center text-slate-400">
//                   No pending asset requests found. All requests have been fulfilled!
//                 </td>
//               </tr>
//             ) : (
//               requests.map((req) => {
//                 const reqId = req.requestID || req.id;
//                 const catalogItem = catalogMap[req.catalogItemID] || {};
//                 const itemName = catalogItem.name || req.serviceName || req.title || 'New Developer Laptop';
//                 const isSoftware = catalogItem.category === 'SOFTWARE' || itemName.toLowerCase().includes('software') || itemName.toLowerCase().includes('license');
//                 const requesterId = req.requestedBy || req.userID || req.userId || 2;
//
//                 return (
//                   <tr key={reqId} className="hover:bg-slate-50">
//                     <td className="p-4 font-semibold text-plum">#{reqId}</td>
//                     <td className="p-4 font-medium text-slate-800">
//                       User #{requesterId}
//                     </td>
//                     <td className="p-4 font-medium">
//                       {itemName}
//                     </td>
//
//                     {/* Stock / License Selection */}
//                     <td className="p-4">
//                       {isSoftware ? (
//                         <select
//                           className="p-2 border rounded-md text-xs w-full bg-white focus:ring-2 focus:ring-cyanaccent-300"
//                           value={selectedLicense[reqId] || ''}
//                           onChange={(e) =>
//                             setSelectedLicense({ ...selectedLicense, [reqId]: e.target.value })
//                           }
//                         >
//                           <option value="">-- Select License --</option>
//                           {licenses.map((l) => (
//                             <option key={l.id || l.licenseID} value={l.id || l.licenseID}>
//                               {l.softwareName} ({l.totalSeats - l.usedSeats} seats left)
//                             </option>
//                           ))}
//                         </select>
//                       ) : (
//                         <select
//                           className="p-2 border rounded-md text-xs w-full bg-white focus:ring-2 focus:ring-cyanaccent-300"
//                           value={selectedAsset[reqId] || ''}
//                           onChange={(e) =>
//                             setSelectedAsset({ ...selectedAsset, [reqId]: e.target.value })
//                           }
//                         >
//                           <option value="">-- Select In-Stock Hardware --</option>
//                           {assets
//                             .filter((a) => a.status === 'IN_STOCK' || a.status === 'AVAILABLE' || !a.status)
//                             .map((a) => (
//                               <option key={a.id || a.assetID} value={a.id || a.assetID}>
//                                 {a.make} {a.model} (SN: {a.serialNumber})
//                               </option>
//                             ))}
//                         </select>
//                       )}
//                     </td>
//
//                     {/* Actions */}
//                     <td className="p-4 text-right space-x-2">
//                       {isSoftware ? (
//                         <button
//                           onClick={() => handleApproveSoftware(reqId)}
//                           className="px-3 py-1.5 bg-cyanaccent-300 text-plum font-semibold text-xs rounded-md hover:opacity-90 transition-all"
//                         >
//                           Allocate Seat
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => handleApproveHardware(reqId, requesterId)}
//                           className="px-3 py-1.5 bg-plum text-white font-semibold text-xs rounded-md hover:bg-opacity-90 transition-all"
//                         >
//                           Assign Hardware
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAssets, listLicenses, fulfillHardwareRequest, fulfillSoftwareRequest, createLicense } from '../../api/assets';
import { listServiceRequests, listCatalog, updateServiceRequestStatus } from '../../api/catalog';
import { listUsersByRole } from '../../api/users';

export default function PendingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [catalogList, setCatalogList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [l1UserId, setL1UserId] = useState(3);

  const [selectedAsset, setSelectedAsset] = useState({});
  const [selectedLicense, setSelectedLicense] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetRes, licenseRes, reqRes, catalogRes, l1Users] = await Promise.all([
        listAssets().catch(() => []),
        listLicenses().catch(() => []),
        listServiceRequests().catch(() => []),
        listCatalog().catch(() => []),
        listUsersByRole('L1_SUPPORT').catch(() => [])
      ]);

      setAssets(assetRes || []);
      setLicenses(licenseRes || []);
      setCatalogList(catalogRes || []);

      if (l1Users && l1Users.length > 0) {
        setL1UserId(l1Users[0].userID);
      }

      const allRequests = reqRes || [];

      // Filter: Keep pending hardware/software requests that have been approved (status is IN_PROGRESS)
      const pendingReqs = allRequests.filter((r) => {
        const catalogItem = (catalogRes || []).find(
          (c) => String(c.itemID || c.catalogItemID || c.id) === String(r.catalogItemID)
        ) || {};
        const category = String(catalogItem.category || r.category || '').toUpperCase();
        const itemName = catalogItem.serviceName || catalogItem.name || r.serviceName || '';
        const textSearch = itemName.toLowerCase();

        const isHardwareOrSoftware =
          category === 'HARDWARE' ||
          category === 'SOFTWARE' ||
          textSearch.includes('laptop') ||
          textSearch.includes('monitor') ||
          textSearch.includes('hardware') ||
          textSearch.includes('software') ||
          textSearch.includes('license') ||
          textSearch.includes('figma') ||
          textSearch.includes('adobe') ||
          textSearch.includes('jetbrains') ||
          textSearch.includes('microsoft');

        if (!isHardwareOrSoftware) return false;

        const st = String(r.status || '').toUpperCase();
        return st === 'IN_PROGRESS';
      });

      pendingReqs.forEach((r) => {
        const reqId = r.requestID || r.id;
        localStorage.removeItem('request_rejection_remark_' + reqId);
      });

      setRequests(pendingReqs);
    } catch (err) {
      console.error("Error loading pending requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveHardware = async (requestId, userId) => {
    const assetId = window.prompt(`Enter Asset ID to assign to User #${userId}:`);
    if (assetId === null) return;
    if (assetId.trim() === '') {
      alert("Asset ID is required.");
      return;
    }
    try {
      // Pass -1 as the first argument so the request parameter is present but does not match any request in DB
      await fulfillHardwareRequest(-1, Number(assetId), Number(userId));
      // Manually transition status to 'SUBMITTED' and assign back to L1 Support
      await updateServiceRequestStatus(requestId, 'SUBMITTED', l1UserId);
      localStorage.removeItem('request_rejection_remark_' + requestId);
      alert(`Hardware assigned successfully for request #${requestId}!`);
      loadData();
    } catch (err) {
      alert("Error assigning hardware: " + (err.friendlyMessage || err.message));
      loadData();
    }
  };

  const handleApproveSoftware = async (requestId, userId, defaultName) => {
    const softwareName = window.prompt("Enter Software Name to allocate:", defaultName || "Software License");
    if (softwareName === null) return;
    if (softwareName.trim() === '') {
      alert("Software name is required.");
      return;
    }
    const vendor = window.prompt("Enter Vendor (optional):", "Adobe");
    if (vendor === null) return;

    try {
      const expiryDateStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      
      // 1. Create software license in backend database (persists to software_licenses table)
      const savedLicense = await createLicense({
        softwareName: softwareName.trim(),
        vendor: vendor.trim() || '—',
        expiryDate: expiryDateStr,
        status: 'ACTIVE',
        assignedToID: Number(userId)
      });

      const licId = savedLicense.licenseID || savedLicense.licenseId || savedLicense.id;

      // Automatically allocate in localStorage for the requested user
      const userLicsKey = 'user_licenses_' + userId;
      const userLics = JSON.parse(localStorage.getItem(userLicsKey) || '[]');
      userLics.push({
        id: licId || Date.now(),
        softwareName: softwareName.trim(),
        vendor: vendor.trim() || '—',
        expiryDate: expiryDateStr,
        status: 'ACTIVE'
      });
      localStorage.setItem(userLicsKey, JSON.stringify(userLics));

      // 2. Manually transition status to 'SUBMITTED' and assign back to L1 Support
      await updateServiceRequestStatus(requestId, 'SUBMITTED', l1UserId);
      localStorage.removeItem('request_rejection_remark_' + requestId);
      alert(`Software license seat allocated successfully for request #${requestId}!`);
      loadData();
    } catch (err) {
      alert("Error allocating software seat: " + (err.friendlyMessage || err.message));
      loadData();
    }
  };

  const handleReject = async (requestId) => {
    const remark = window.prompt("Enter reason for rejection:");
    if (remark === null) return; // user cancelled prompt
    if (remark.trim() === '') {
      alert("Rejection reason cannot be empty.");
      return;
    }
    try {
      // 1. Store rejection remark in local storage
      localStorage.setItem('request_rejection_remark_' + requestId, remark.trim());
      // 2. Set request status to 'SUBMITTED' and assign back to L1 Support
      await updateServiceRequestStatus(requestId, 'SUBMITTED', l1UserId, remark.trim());
      alert(`Request #${requestId} has been rejected and returned to L1 Support.`);
      loadData();
    } catch (err) {
      alert("Error rejecting request: " + (err.friendlyMessage || err.message));
      loadData();
    }
  };

  if (loading) return <div className="p-6 text-slate-600">Loading pending requests...</div>;

  return (
    <div className="p-6 bg-mint">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-plum">Pending Asset Requests</h1>
        <p className="text-slateblue text-sm">
          Review incoming requests assigned to IT Asset Management, pick available stock or licenses, and fulfill assignments.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slateblue text-white text-xs uppercase tracking-wider">
              <th className="p-4">Request ID</th>
              <th className="p-4">Requested By</th>
              <th className="p-4">Item Requested</th>
              <th className="p-4">Assign Stock / License</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-400">
                  No pending asset requests found. All requests have been fulfilled!
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const reqId = req.requestID || req.id;

                // Match catalog item by comparing catalogItemID / itemID / id
                const catalogItem = catalogList.find(
                  (c) => String(c.itemID || c.catalogItemID || c.id) === String(req.catalogItemID)
                ) || {};

                // Get true service name and category
                const itemName =
                  catalogItem.serviceName ||
                  catalogItem.name ||
                  req.serviceName ||
                  req.catalogItemName ||
                  req.title ||
                  'Asset Request';

                const category = String(catalogItem.category || req.category || '').toUpperCase();
                const textSearch = (itemName + ' ' + (req.details || '')).toLowerCase();

                // Check if this is a software license request
                const isSoftware =
                  category === 'SOFTWARE' ||
                  textSearch.includes('software') ||
                  textSearch.includes('license') ||
                  textSearch.includes('figma') ||
                  textSearch.includes('adobe') ||
                  textSearch.includes('jetbrains') ||
                  textSearch.includes('microsoft');

                const requesterId = req.requesterID || req.requestedBy || req.userID || req.userId || 2;

                return (
                  <tr key={reqId} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-plum">#{reqId}</td>
                    <td className="p-4 font-medium text-slate-800">
                      User #{requesterId}
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {itemName}
                    </td>

                    <td className="p-4">
                      {isSoftware ? (
                        <button
                          onClick={() => navigate(`/asset/licenses?userId=${requesterId}`)}
                          className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center gap-1.5 w-full"
                        >
                          Check Licenses for User #{requesterId}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/asset/hardware?userId=${requesterId}`)}
                          className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center gap-1.5 w-full"
                        >
                          Check Inventory for User #{requesterId}
                        </button>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {isSoftware ? (
                        <button
                          onClick={() => handleApproveSoftware(reqId, requesterId, itemName)}
                          className="px-3 py-1.5 bg-cyanaccent-300 text-plum font-semibold text-xs rounded-md hover:opacity-90 transition-all inline-block"
                        >
                          Allocate Seat
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveHardware(reqId, requesterId)}
                          className="px-3 py-1.5 bg-plum text-white font-semibold text-xs rounded-md hover:bg-opacity-90 transition-all inline-block"
                        >
                          Assign Hardware
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(reqId)}
                        className="px-3 py-1.5 bg-red-600 text-white font-semibold text-xs rounded-md hover:bg-red-700 transition-all inline-block"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}