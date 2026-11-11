import React, { useState } from "react";
import FacultyAvatar, { getFacultyInitials } from "./FacultyAvatar";
import {
  Loader2,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  RefreshCw,
  FolderOpen
} from "lucide-react";

/**
 * Standardized Button Component
 * Variants: primary, secondary, outline, ghost, danger, success
 * Sizes: sm, md, lg, icon
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer tracking-tight";

  const sizeStyles = {
    sm: "text-xs h-8 px-3 gap-1.5",
    md: "text-xs sm:text-sm h-9 sm:h-10 px-3.5 sm:px-4 gap-2",
    lg: "text-sm sm:text-base h-11 px-5 gap-2.5 font-semibold",
    icon: "w-9 h-9 p-0 rounded-lg",
  };

  const variantStyles = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs focus-visible:ring-indigo-500 border border-indigo-600",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs focus-visible:ring-slate-400 active:bg-slate-100",
    outline:
      "bg-transparent hover:bg-indigo-50/70 text-indigo-700 border border-indigo-200 focus-visible:ring-indigo-500",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-300",
    danger:
      "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs focus-visible:ring-red-500 border border-red-600",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-emerald-500 border border-emerald-600",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}

/**
 * Standardized Input Component
 */
export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = "text",
  className = "",
  id,
  name,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 tracking-tight"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={actualType}
          className={`w-full h-10 rounded-lg border bg-white text-slate-900 text-xs sm:text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
            Icon ? "pl-10" : "pl-3.5"
          } ${isPassword ? "pr-10" : "pr-3.5"} ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20 hover:border-slate-300"
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

/**
 * Standardized Textarea Component
 */
export function Textarea({
  label,
  error,
  helperText,
  className = "",
  id,
  name,
  rows = 4,
  ...props
}) {
  const textareaId = id || name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-slate-700 tracking-tight"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        className={`w-full p-3 rounded-lg border bg-white text-slate-900 text-xs sm:text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20 hover:border-slate-300"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

/**
 * Standardized Select Component
 */
export function Select({
  label,
  options = [],
  error,
  helperText,
  className = "",
  id,
  name,
  children,
  ...props
}) {
  const selectId = id || name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 tracking-tight">
          {label}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        className={`w-full h-10 px-3.5 rounded-lg border bg-white text-slate-900 text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20 hover:border-slate-300"
        } ${className}`}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
      </select>
      {error ? (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

/**
 * Card Component
 */
export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs transition-all duration-150 ${
        hover ? "hover:border-slate-300 hover:shadow-xs" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Standardized Badge Component
 */
export function Badge({
  children,
  variant = "indigo",
  size = "md",
  className = "",
  icon: Icon,
}) {
  const variantStyles = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    blue: "bg-blue-50 text-blue-700 border-blue-200/80",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    amber: "bg-amber-50 text-amber-800 border-amber-200/80",
    warning: "bg-amber-50 text-amber-800 border-amber-200/80",
    red: "bg-red-50 text-red-700 border-red-200/80",
    danger: "bg-red-50 text-red-700 border-red-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    default: "bg-slate-100 text-slate-700 border-slate-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200/80",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-0.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border ${
        variantStyles[variant] || variantStyles.indigo
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

/**
 * StatCard for Dashboards
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  variant = "indigo",
  className = "",
}) {
  const iconVariants = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              iconVariants[variant] || iconVariants.indigo
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </Card>
  );
}

/**
 * Progress Bar
 */
export function ProgressBar({
  value = 0,
  max = 100,
  showLabel = false,
  color = "indigo",
  height = "h-2",
  className = "",
}) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const colorStyles = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    blue: "bg-blue-600",
    red: "bg-red-500",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
          <span>Progress</span>
          <span className="font-semibold text-slate-900">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-300 ease-out ${
            colorStyles[color] || colorStyles.indigo
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Standardized Empty State
 */
export function EmptyState({
  icon: Icon = FolderOpen,
  title = "No data found",
  description,
  actionText,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`text-center py-10 px-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs ${className}`}
    >
      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Alert component
 */
export function Alert({
  type = "info",
  variant,
  title,
  children,
  onClose,
  className = "",
}) {
  const resolvedType = (variant === "danger" ? "error" : variant) || type;
  const typeConfigs = {
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-900",
      icon: Info,
      iconColor: "text-blue-600",
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-900",
      icon: AlertTriangle,
      iconColor: "text-amber-700",
    },
    error: {
      bg: "bg-red-50 border-red-200 text-red-900",
      icon: AlertCircle,
      iconColor: "text-red-600",
    },
  };

  const config = typeConfigs[resolvedType] || typeConfigs.info;
  const Icon = config.icon;

  return (
    <div
      className={`p-3.5 rounded-lg border flex items-start gap-3 ${config.bg} ${className}`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-xs">
        {title && <p className="font-bold mb-0.5">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Skeleton Loader
 */
export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />
  );
}

/**
 * Card Skeleton
 */
export function CardSkeleton() {
  return (
    <Card className="p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </Card>
  );
}

/**
 * Course Skeleton
 */
export function CourseSkeleton() {
  return (
    <Card className="overflow-hidden space-y-3">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="pt-2">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Avatar
 */
export function Avatar({
  src,
  name = "User",
  size = "md",
  className = "",
}) {
  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-xs font-semibold",
    lg: "w-12 h-12 text-sm",
    xl: "w-16 h-16 sm:w-20 sm:h-20 text-xl font-bold",
  };

  const initials = (typeof getFacultyInitials === "function" && name)
    ? getFacultyInitials(name)
    : (name ? String(name).slice(0, 2).toUpperCase() : "U");

  return (
    <div
      className={`rounded-lg flex items-center justify-center font-bold font-sans bg-indigo-50 text-indigo-700 border border-indigo-200/80 overflow-hidden shrink-0 select-none ${
        sizeStyles[size] || sizeStyles.md
      } ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

/**
 * Modal Component
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className={`bg-white w-full rounded-xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${maxWidth}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

/**
 * Spinner Component
 */
export function Spinner({ size = "md", className = "" }) {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };
  return (
    <Loader2
      className={`animate-spin text-indigo-600 ${sizeStyles[size] || sizeStyles.md} ${className}`}
    />
  );
}

/**
 * ErrorMessage Component with retry
 */
export function ErrorMessage({
  title = "Something went wrong",
  message = "We couldn't load this information. Please try again.",
  onRetry,
}) {
  return (
    <div className="p-6 rounded-xl bg-red-50/70 border border-red-200 text-center space-y-3 max-w-md mx-auto">
      <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold text-red-900">{title}</h4>
      <p className="text-xs text-red-700 leading-relaxed">{message}</p>
      {onRetry && (
        <div className="pt-1">
          <Button variant="danger" size="sm" onClick={onRetry} icon={RefreshCw}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Standardized PageHeader component
 */
export function PageHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  actions,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5 ${className}`}
    >
      <div className="space-y-1">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-1">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{badge}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 text-xs sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Pagination Component
 */
export function Pagination({ currentPage, totalPages, onPageChange, className = "" }) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <span className="text-xs font-semibold text-slate-600 px-3">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}

export { FacultyAvatar, getFacultyInitials };
