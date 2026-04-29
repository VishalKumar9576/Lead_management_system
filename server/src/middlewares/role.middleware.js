import { sendError } from "../utils/response.js";

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, "Unauthorized access", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, "Forbidden: insufficient permissions", 403);
    }

    next();
  };
};

export default roleMiddleware;