import { Response, Request } from "express";
import { AuthRequest } from "../../middleware/auth";
import userService from "../../services/userService";
import { ApiResponseBuilder } from "../utils/response.util";

export const register = async (req: Request, res: Response) => {
    const result = await userService.register(req.body);

    if (result.success) {
        return res.status(201).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 422).json(
        ApiResponseBuilder.error(result.message, result.errors, result.status)
    );
};

export const login = async (req: Request, res: Response) => {
    const result = await userService.login(req.body);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 401).json(
        ApiResponseBuilder.error(result.message, result.errors, result.status)
    );
};

export const createUser = async (req: AuthRequest, res: Response) => {
    const result = await userService.createUser(req.body);

    if (result.success) {
        return res.status(201).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 400).json(
        ApiResponseBuilder.error(result.message, result.errors, result.status)
    );
};

export const listUsers = async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, roleId } = req.query;

    const result = await userService.listUsers();

    if (result.success) {
        let users = result.data;

        if (roleId) {
            users = users.filter((user: any) => user.roleId?.toString() === roleId);
        }

        const total = users.length;
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedData = users.slice(startIndex, endIndex);

        return res.status(200).json(
            ApiResponseBuilder.paginated(
                paginatedData,
                Number(page),
                Number(limit),
                total,
                "/api/v1/auth/users"
            )
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const getUserById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await userService.getProfile(id);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 404).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await userService.updateUser(id, req.body);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 400).json(
        ApiResponseBuilder.error(result.message, result.errors, result.status)
    );
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await userService.deleteUser(id);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 404).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json(
            ApiResponseBuilder.error("Non authentifié", undefined, 401)
        );
    }

    const result = await userService.getProfile(userId);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 404).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const listRoles = async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20 } = req.query;

    const result = await userService.listRolesWithCanDelete();

    if (result.success) {
        const roles = result.data;
        const total = roles.length;
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedData = roles.slice(startIndex, endIndex);

        return res.status(200).json(
            ApiResponseBuilder.paginated(
                paginatedData,
                Number(page),
                Number(limit),
                total,
                "/api/v1/auth/roles"
            )
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const createRole = async (req: AuthRequest, res: Response) => {
    const result = await userService.createRole(req.body);

    if (result.success) {
        return res.status(201).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 400).json(
        ApiResponseBuilder.error(result.message, result.errors, result.status)
    );
};

export const updateRole = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await userService.updateRole(id, req.body);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 400).json(
        ApiResponseBuilder.error(result.message, result.errors, result.status)
    );
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await userService.deleteRole(id);

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 400).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};

export const listPermissions = async (req: AuthRequest, res: Response) => {
    const result = await userService.listPermissions();

    if (result.success) {
        return res.status(200).json(
            ApiResponseBuilder.success(result.data, result.message)
        );
    }

    return res.status(result.status || 500).json(
        ApiResponseBuilder.error(result.message, undefined, result.status)
    );
};
