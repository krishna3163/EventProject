import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import OrgAdminDashboard from './OrgAdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

/**
 * Dashboard acts as a router — it renders the correct dashboard
 * based on the authenticated user's role.
 */
const Dashboard = () => {
    const { user, isSuperAdmin, isOrgAdmin } = useAuth();

    if (!user) return null;

    if (isSuperAdmin || user?.role === 'ADMIN') return <SuperAdminDashboard />;
    if (isOrgAdmin) return <OrgAdminDashboard />;

    // STUDENT, USER all get the student view
    return <StudentDashboard />;
};

export default Dashboard;
