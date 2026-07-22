import { useNavigate } from "react-router-dom";
import {
  Upload,
  Sparkles,
  BarChart2,
  LayoutDashboard,
  FileDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { quickActions } from "../../data/dashboardMockData";
import type { QuickAction } from "../../types/dashboard";

export function QuickActions() {
  const navigate = useNavigate();

  const getIconForAction = (action: QuickAction["action"]) => {
    switch (action) {
      case "upload":
        return <Upload className="h-5 w-5 text-primary" />;
      case "clean":
        return <Sparkles className="h-5 w-5 text-warning-DEFAULT" />;
      case "chart":
        return <BarChart2 className="h-5 w-5 text-cyan-DEFAULT" />;
      case "dashboard":
        return <LayoutDashboard className="h-5 w-5 text-purple-DEFAULT" />;
      case "report":
        return <FileDown className="h-5 w-5 text-success-DEFAULT" />;
    }
  };

  const getBgForAction = (action: QuickAction["action"]) => {
    switch (action) {
      case "upload":
        return "bg-primary-soft";
      case "clean":
        return "bg-warning-soft";
      case "chart":
        return "bg-cyan-soft";
      case "dashboard":
        return "bg-purple-soft";
      case "report":
        return "bg-success-soft";
    }
  };

  const handleActionClick = (action: QuickAction["action"]) => {
    switch (action) {
      case "upload":
        navigate("/data-schema");
        break;
      case "clean":
        navigate("/clean-transform");
        break;
      case "chart":
        navigate("/visual-builder");
        break;
      case "dashboard":
        navigate("/dashboard-canvas");
        break;
      case "report":
        navigate("/export-report");
        break;
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-3 pb-3">
        <div className="flex flex-col gap-1">
          {quickActions.map((item) => (
            <button
              key={item.id}
              onClick={() => handleActionClick(item.action)}
              className="group flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getBgForAction(
                    item.action
                  )}`}
                >
                  {getIconForAction(item.action)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-textPrimary">
                    {item.title}
                  </span>
                  <span className="text-xs text-textSecondary">
                    {item.description}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
