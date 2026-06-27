export type DashboardActionStatus = "idle" | "success" | "error";

export type DashboardActionState = {
  status: DashboardActionStatus;
  message: string;
  id: string;
};

export const initialDashboardActionState: DashboardActionState = {
  status: "idle",
  message: "",
  id: "",
};
