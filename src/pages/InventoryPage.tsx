import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  Boxes,
  Calendar,
  IndianRupee,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { api, InventoryResponse } from "../services/api";
import { InventoryBatch, ExpiryPriority } from "../types";

interface InventoryPageProps {
  onSelectBatchForRecommendation?: (batchId: string) => void;
  initialSearch?: string;
  initialPriority?: string;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  onSelectBatchForRecommendation,
  initialSearch = "",
  initialPriority = ""
}) => {
  const [data, setData] = useState<InventoryBatch[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    total_pages: 1,
    total_stock_value: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState(initialPriority);
  const [status, setStatus] = useState("");
  const [expiryBucket, setExpiryBucket] = useState("");

  const LOCATIONS = [
    { id: "LOC-001", name: "Chennai Central Distribution Hub" },
    { id: "LOC-002", name: "Anna Nagar Community Dispensary" },
    { id: "LOC-003", name: "T Nagar Primary Health Center" },
    { id: "LOC-004", name: "Adyar Regional Pharmacy" },
    { id: "LOC-005", name: "Velachery Clinic Pharmacy" },
    { id: "LOC-006", name: "Tambaram Suburban Dispensary" },
    { id: "LOC-007", name: "Chromepet Health Post" },
    { id: "LOC-008", name: "Porur Satellite Pharmacy" },
    { id: "LOC-009", name: "Madipakkam Community Center" },
    { id: "LOC-010", name: "Guindy Industrial Area Dispensary" }
  ];

  const fetchInventory = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const res = await api.getInventory({
        page,
        limit: pagination.limit,
        search,
        location,
        priority,
        status,
        expiryBucket
      });
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(1);
  }, [search, location, priority, status, expiryBucket]);

  const getPriorityBadge = (p: ExpiryPriority, days: number) => {
    if (days < 0) {
      return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-200 text-slate-800">Expired</span>;
    }
    switch (p) {
      case "Critical":
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-red-100 text-red-800 animate-pulse">{days}d (Critical)</span>;
      case "High":
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-orange-100 text-orange-800">{days}d (High)</span>;
      case "Medium":
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-yellow-100 text-yellow-800">{days}d (Med)</span>;
      case "Low":
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-blue-800">{days}d (Low)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-700">{days}d</span>;
    }
  };

  return (
    <div id="inventory-page" className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pharmacy Inventory &amp; Batch Telemetry</h2>
            <p className="text-xs text-slate-500">
              Granular batch-level tracking, shelf-life monitoring, and storage compliance across network hubs.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              Total Filtered Value: <strong className="text-slate-900 font-bold">₹{pagination.total_stock_value?.toLocaleString()}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              Records: <strong className="text-slate-900 font-bold">{pagination.total}</strong>
            </span>
          </div>
        </div>

        {/* Filter Inputs Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="inventory-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Medicine, Generic, Batch ID..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Location Filter */}
          <div>
            <select
              id="inventory-location-filter"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All 10 Regional Locations</option>
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry Bucket Filter */}
          <div>
            <select
              id="inventory-expiry-filter"
              value={expiryBucket}
              onChange={(e) => setExpiryBucket(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Expiry Horizons</option>
              <option value="0–7">0–7 Days (Critical Expiry)</option>
              <option value="8–30">8–30 Days (High Urgency)</option>
              <option value="31–60">31–60 Days (Medium Window)</option>
              <option value="61–90">61–90 Days (Low Urgency)</option>
              <option value="Normal">90+ Days (Stable Shelf)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              id="inventory-priority-filter"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Priority Classes</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSearch("");
                setLocation("");
                setPriority("");
                setStatus("");
                setExpiryBucket("");
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors w-full cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="inventory-batches-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10.5px]">
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Medicine &amp; Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Stock Value</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Days Left</th>
                <th className="py-3 px-3">Storage</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Loading inventory records...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No batches match the selected criteria.
                  </td>
                </tr>
              ) : (
                data.map((batch) => (
                  <tr
                    key={batch.batch_id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      batch.days_to_expiry <= 7 && batch.days_to_expiry >= 0 ? "bg-red-50/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {batch.batch_id}
                      {batch.is_data_corrupted === 1 && (
                        <span
                          className="ml-1.5 inline-block text-amber-600"
                          title={`Data quality issue: ${batch.corruption_reason}`}
                        >
                          <AlertTriangle className="w-3 h-3 inline" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{batch.medicine_name}</div>
                      <div className="text-[10.5px] text-slate-500">
                        {batch.generic_name} • {batch.category}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{batch.location_name}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-900">
                      {batch.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      ₹{batch.unit_price}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{Math.round(batch.stock_value).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{batch.expiry_date}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getPriorityBadge(batch.priority, batch.days_to_expiry)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10.5px] px-2 py-0.5 rounded font-medium ${
                          batch.storage_type?.includes("Cold")
                            ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {batch.storage_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          batch.batch_status === "Available"
                            ? "bg-emerald-100 text-emerald-800"
                            : batch.batch_status === "Near Expiry"
                            ? "bg-orange-100 text-orange-800"
                            : batch.batch_status === "Reserved"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {batch.batch_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} batches
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchInventory(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-800">
              Page {pagination.page} of {pagination.total_pages || 1}
            </span>
            <button
              onClick={() => fetchInventory(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
