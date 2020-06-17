
const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/main/Login.vue") },
      { path: "main", component: () => import("pages/main/Main.vue") },
      { path: "settings", component: () => import("pages/main/Settings.vue") },
      { path: "help", component: () => import("pages/main/Help.vue") },
      { path: "civil_bills", component: () => import("pages/main/CivilBills.vue") },
      { path: "civil_details", component: () => import("pages/main/CivilDetails.vue") },
      { path: "legal_details", component: () => import("pages/main/LegalDetails.vue") },
      { path: "legal_reports", component: () => import("pages/main/LegalReports.vue") },
      { path: "trunks_report", component: () => import("pages/main/TrunksReport.vue") }
    ],
  },
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/main/Login.vue"),
  });
}

export default routes;
