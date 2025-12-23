/**
 * Authentication Components
 *
 * Components:
 * - LoginForm - Email/password login form with validation
 * - SignupForm - User registration form with validation
 * - AuthGuard - HOC/wrapper to protect authenticated routes
 *
 * Handles user authentication UI and route protection.
 */

export { LoginForm } from "./LoginForm";
export { SignupForm } from "./SignupForm";
export { AuthGuard, withAuthGuard } from "./AuthGuard";
