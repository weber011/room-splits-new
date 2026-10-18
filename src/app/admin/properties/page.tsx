"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { adminService, AdminPropertyRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, Archive, CheckCircle, Building2, MapPin, Search } from "lucide-react";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<AdminPropertyRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getProperties({
        status: statusFilter,
        city: cityFilter,
        search,
      });
      setProperties(data);
    } catch (err) {
      console.error("Failed to load admin properties", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, cityFilter, search]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProperties();
  };

  const handleModerate = async (id: string, action: "archive" | "publish" | "verify" | "unverify", title: string) => {
    let reason: string | undefined;

    if (action === "archive") {
      const promptReason = prompt(`Reason for archiving "${title}" (e.g. Terms violation, inaccurate pricing):`);
      if (!promptReason || !promptReason.trim()) {
        alert("A moderation reason is required to archive a listing.");
        return;
      }
      reason = promptReason.trim();
    } else {
      if (!confirm(`Are you sure you want to perform action "${action}" on "${title}"?`)) {
        return;
      }
    }

    setProcessingId(id);
    try {
      const success = await adminService.moderateProperty(id, action, reason);
      if (success) {
        alert(`Property "${title}" updated successfully.`);
        await loadProperties();
      } else {
        alert("Failed to moderate property. Administrator privileges required.");
      }
    } catch (err) {
      console.error("Moderation error:", err);
      alert("An unexpected error occurred during property moderation.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Property Moderation</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Building2 className="h-8 w-8 text-amber-400" />
              <span>Platform Properties Moderation</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit student accommodations across Jharkhand, verify legitimacy, and archive rule-violating listings.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search listing title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-800 text-white text-xs h-10"
              />
            </div>
            <Button type="submit" size="sm" variant="default" className="text-xs font-bold cursor-pointer">
              Search
            </Button>
          </form>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "published", "draft", "archived"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                onClick={() => setStatusFilter(st)}
                className="uppercase text-[11px] cursor-pointer"
              >
                {st}
              </Button>
            ))}
          </div>

          {/* City Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Hazaribagh"].map((city) => (
              <Button
                key={city}
                size="sm"
                variant={cityFilter === city ? "secondary" : "ghost"}
                onClick={() => setCityFilter(city)}
                className="text-xs cursor-pointer text-slate-300"
              >
                {city}
              </Button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs">Loading properties directory...</p>
          </div>
        ) : properties.length === 0 ? (
          <Card className="p-12 text-center border-slate-800 bg-slate-900/80 rounded-2xl space-y-2">
            <Building2 className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-sm">No Properties Found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search terms or filter selection.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <Card
                key={prop.id}
                className="border-slate-800 bg-slate-900/80 p-5 space-y-4 flex flex-col justify-between rounded-2xl hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-white line-clamp-1">{prop.title}</h3>
                    <Badge
                      variant={
                        prop.status === "published"
                          ? "accent"
                          : prop.status === "draft"
                          ? "secondary"
                          : "danger"
                      }
                      className="text-[9px] uppercase shrink-0 font-mono"
                    >
                      {prop.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span>{prop.locality}, <strong>{prop.city}</strong></span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Host: <strong className="text-white">{prop.ownerBusinessName}</strong> ({prop.ownerName})
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-emerald-400">Starting: ₹{prop.startingPrice.toLocaleString("en-IN")}/mo</span>
                    {prop.isVerified && (
                      <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                        Verified Listing
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Link href={`/property/${prop.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full gap-1 text-xs cursor-pointer">
                        <Eye className="h-3.5 w-3.5" />
                        Public Preview
                      </Button>
                    </Link>
                  </div>

                  <div className="flex gap-2">
                    {prop.status !== "published" && (
                      <Button
                        size="sm"
                        variant="default"
                        disabled={processingId === prop.id}
                        onClick={() => handleModerate(prop.id, "publish", prop.title)}
                        className="flex-1 text-xs gap-1 cursor-pointer font-bold"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Restore / Publish
                      </Button>
                    )}

                    {prop.status !== "archived" && (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={processingId === prop.id}
                        onClick={() => handleModerate(prop.id, "archive", prop.title)}
                        className="flex-1 text-xs gap-1 cursor-pointer font-bold"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Archive Listing
                      </Button>
                    )}

                    {!prop.isVerified ? (
                      <Button
                        size="sm"
                        variant="warning"
                        disabled={processingId === prop.id}
                        onClick={() => handleModerate(prop.id, "verify", prop.title)}
                        className="text-xs cursor-pointer"
                      >
                        Verify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={processingId === prop.id}
                        onClick={() => handleModerate(prop.id, "unverify", prop.title)}
                        className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        Unverify
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
