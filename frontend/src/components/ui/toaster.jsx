import { useToast } from "../../hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast";
import { cn } from "../../lib/utils";
const PROGRESS_DURATION = 3000;
const progressColor = (variant) => {
    switch (variant) {
        case "destructive":
            return "bg-destructive";
        case "success":
            return "bg-success";
        case "info":
            return "bg-info";
        default:
            return "bg-primary";
    }
};
export function Toaster() {
    const { toasts } = useToast();
    return (<ToastProvider duration={PROGRESS_DURATION}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
            return (<Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1 pr-4">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
            <span className={cn("absolute bottom-0 left-0 h-1 w-full origin-left", progressColor(variant))} style={{
                    animation: `toast-progress ${PROGRESS_DURATION}ms linear forwards`,
                }}/>
          </Toast>);
        })}
      <ToastViewport />
    </ToastProvider>);
}
