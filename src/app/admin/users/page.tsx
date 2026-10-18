"use client";

import { useState, useEffect, useCallback } from "react";
import { adminService, AdminUserRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Search, Shield, Building2, GraduationCap } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        role: roleFilter,
        search,
      });
      setUsers(data);
    } catch (err) {
      console.error("Failed to load user directory", err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Directory</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Users className="h-8 w-8 text-amber-400" />
              <span>Platform Users Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Inspect student residents, registered PG owners, and system administrators across RoomSplits.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-80">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-800 text-white text-xs h-10"
              />
            </div>
            <Button type="submit" size="sm" variant="default" className="text-xs font-bold cursor-pointer">
              Search
            </Button>
          </form>

          <div className="flex gap-1.5 flex-wrap">
            {["ALL", "student", "owner", "admin"].map((r) => (
              <Button
                key={r}
                size="sm"
                variant={roleFilter === r ? "default" : "outline"}
                onClick={() => setRoleFilter(r)}
                className="capitalize text-xs cursor-pointer"
              >
                {r === "ALL" ? "All Accounts" : `${r}s`}
              </Button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4 rounded-2xl">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-xs">Loading accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No platform accounts found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Platform Role</th>
                    <th className="py-3 px-4">Associated Entity</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{u.fullName}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{u.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 capitalize font-semibold">
                          {u.role === "admin" && <Shield className="h-3.5 w-3.5 text-amber-400" />}
                          {u.role === "owner" && <Building2 className="h-3.5 w-3.5 text-blue-400" />}
                          {u.role === "student" && <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />}
                          <span className={u.role === "admin" ? "text-amber-400 font-bold" : "text-slate-200"}>
                            {u.role}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {u.ownerBusinessName ? (
                          <span className="font-semibold text-white">{u.ownerBusinessName}</span>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.role === "owner" ? (
                          <Badge
                            variant={
                              u.ownerVerificationStatus === "verified"
                                ? "accent"
                                : u.ownerVerificationStatus === "pending"
                                ? "warning"
                                : "danger"
                            }
                            className="text-[9px] uppercase font-mono"
                          >
                            {u.ownerVerificationStatus || "Unverified"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-700">
                            Student Verified
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
