import Dashboard from "../models/Dashboard";
import Widget from "../models/Widget";
import type {
  IDashboard,
  DashboardCreatePayload,
  DashboardUpdatePayload,
  DashboardBasePayload,
} from "../types/dashboardType";
import type { ApiResponse } from "../types/api";
import { cleanTimeRange } from "../utils/dataSourceUtils";
import DataSource from "../models/DataSource";
import { IDataSource } from "../types/sourceType";
import { toApiSuccess, toApiError } from "../utils/api";
import { generateUUID } from "../utils/uuidGenerator";

/**
 * Service pour gérer les opérations liées aux dashboards.
 * Permet de créer, lire, mettre à jour et supprimer des dashboards,
 * ainsi que de gérer le partage public.
 * @module dashboardService
 */
const dashboardService = {
  /**
   * Crée un nouveau dashboard pour l'utilisateur spécifié.
   * @param {string} userId - L'ID de l'utilisateur propriétaire du dashboard.
   * @param {DashboardBasePayload} data - Les données du dashboard à créer.
   * @returns {Promise<ApiResponse<IDashboard>>} - La réponse contenant le dashboard créé.
   */
  async createDashboard(
    userId: string,
    data: DashboardBasePayload
  ): Promise<ApiResponse<IDashboard>> {
    const timeRange = cleanTimeRange(data.timeRange);

    const dashboard = await Dashboard.create({
      ...data,
      userId,
      ownerId: userId,
      visibility: data.visibility ?? "private",
      autoRefreshIntervalValue: data.autoRefreshIntervalValue,
      autoRefreshIntervalUnit: data.autoRefreshIntervalUnit,
      timeRange,
    });

    return toApiSuccess(dashboard);
  },

  /**
   * Récupère un dashboard par son ID, avec les widgets hydratés.
   * @param {string} id - L'ID du dashboard à récupérer.
   * @param {string} userId - L'ID de l'utilisateur (optionnel pour vérification)
   * @returns {Promise<ApiResponse<IDashboard>>} - La réponse contenant le dashboard avec son layout et ses widgets.
   */
  async getDashboardById(id: string, userId?: string): Promise<ApiResponse<IDashboard>> {
    const dashboard = await Dashboard.findById(id);

    if (!dashboard) {
      return toApiError("Dashboard non trouvé.", 404);
    }

    const widgetIds = dashboard.layout.map((item: any) => item.widgetId);
    const widgets = await Widget.find({ _id: { $in: widgetIds } }).lean();
    const widgetMap = Object.fromEntries(widgets.map((w) => [String(w._id), w]));

    const hydratedLayout = dashboard.layout.map((item: any) => {
      const plainItem = item.toObject ? item.toObject() : { ...item };
      return {
        ...plainItem,
        widget: widgetMap[plainItem.widgetId] || null,
      };
    });

    const dashboardObj = dashboard.toObject();
    dashboardObj.layout = hydratedLayout;
    dashboardObj.widgets = widgets as any[];

    return toApiSuccess(dashboardObj);
  },

  /**
   * Met à jour un dashboard existant.
   * @param {string} id - L'ID du dashboard à mettre à jour.
   * @param {DashboardUpdatePayload} data - Les données de mise à jour du dashboard.
   * @param {string} userId - L'ID de l'utilisateur (optionnel pour vérification)
   * @returns {Promise<ApiResponse<IDashboard>>} - La réponse contenant le dashboard mis à jour.
   */
  async updateDashboard(
    id: string,
    data: DashboardUpdatePayload,
    userId?: string
  ): Promise<ApiResponse<IDashboard>> {
    const timeRange = cleanTimeRange(data.timeRange);

    const updated = await Dashboard.findByIdAndUpdate(
      id,
      {
        ...data,
        visibility: data.visibility ?? "private",
        autoRefreshIntervalValue: data.autoRefreshIntervalValue,
        autoRefreshIntervalUnit: data.autoRefreshIntervalUnit,
        timeRange,
      },
      { new: true }
    );

    if (!updated) {
      return toApiError("Dashboard non trouvé.", 404);
    }

    return toApiSuccess(updated);
  },

  /**
   * Supprime un dashboard par son ID.
   * @param {string} id - L'ID du dashboard à supprimer.
   * @param {string} userId - L'ID de l'utilisateur (optionnel pour vérification)
   * @returns {Promise<ApiResponse<{ message: string }>>} - La réponse indiquant le succès de la suppression.
   */
  async deleteDashboard(id: string, userId?: string): Promise<ApiResponse<{ message: string }>> {
    const dashboard = await Dashboard.findByIdAndDelete(id);

    if (!dashboard) {
      return toApiError("Dashboard non trouvé.", 404);
    }

    return toApiSuccess({ message: "Dashboard supprimé." });
  },

  /**
   * Récupère tous les dashboards de l'utilisateur.
   * @param {string} userId - L'ID de l'utilisateur dont on veut récupérer les dashboards.
   * @returns {Promise<ApiResponse<IDashboard[]>>} - La réponse contenant la liste des dashboards.
   */
  async listUserDashboards(userId: string): Promise<ApiResponse<IDashboard[]>> {
    const dashboards = await Dashboard.find({
      $or: [{ ownerId: userId }, { visibility: "public" }],
    });

    return toApiSuccess(dashboards);
  },

  /**
   * Active le partage public pour un dashboard.
   * @param {string} dashboardId - L'ID du dashboard à partager.
   * @param {string} userId - L'ID de l'utilisateur (optionnel pour vérification)
   * @returns {Promise<ApiResponse<IDashboard>>} - La réponse contenant le dashboard mis à jour.
   */
  async enableShare(
    dashboardId: string,
    userId?: string
  ): Promise<ApiResponse<IDashboard>> {
    const shareId = generateUUID(true, 8, true, "share-");

    const updated = await Dashboard.findByIdAndUpdate(
      dashboardId,
      { shareEnabled: true, shareId },
      { new: true }
    );

    if (!updated) {
      return toApiError("Dashboard non trouvé.", 404);
    }

    if (!updated.shareId) {
      return toApiError("Erreur lors de l'activation du partage.", 500);
    }

    return toApiSuccess(updated);
  },

  /**
   * Désactive le partage public pour un dashboard.
   * @param {string} dashboardId - L'ID du dashboard dont on veut désactiver le partage.
   * @param {string} userId - L'ID de l'utilisateur (optionnel pour vérification)
   * @returns {Promise<ApiResponse<IDashboard>>} - La réponse contenant le dashboard mis à jour.
   */
  async disableShare(
    dashboardId: string,
    userId?: string
  ): Promise<ApiResponse<IDashboard>> {
    const updated = await Dashboard.findByIdAndUpdate(
      dashboardId,
      { shareEnabled: false, shareId: null },
      { new: true }
    );
    if (!updated) {
      return toApiError("Dashboard non trouvé.", 404);
    }

    return toApiSuccess(updated);
  },

  async getSharedDashboard(shareId: string): Promise<ApiResponse<IDashboard>> {
    const dashboard = await Dashboard.findOne({ shareId, shareEnabled: true });
    if (!dashboard) {
      return toApiError("Dashboard non trouvé ou non partagé.", 404);
    }

    const widgetIds = dashboard.layout.map((item: any) => item.widgetId);

    const widgets = await Widget.find({ _id: { $in: widgetIds } }).lean();

    const widgetMap = Object.fromEntries(widgets.map((w) => [String(w._id), w]));

    const hydratedLayout = dashboard.layout.map((item: any) => {
      const plainItem = item.toObject ? item.toObject() : { ...item };
      return {
        ...plainItem,
        widget: widgetMap[plainItem.widgetId] || null,
      };
    });

    const dashboardObj = dashboard.toObject();

    dashboardObj.layout = hydratedLayout;
    dashboardObj.widgets = widgets as any[];

    return toApiSuccess(dashboardObj);
  },

  /**
   * Récupère les sources de données utilisées dans un dashboard partagé.
   * @param {string} shareId - L'ID de partage du dashboard.
   * @returns {Promise<ApiResponse<DataSource[]>>} - La réponse contenant les sources de données.
   */
  async getSharedDashboardSources(
    shareId: string
  ): Promise<ApiResponse<IDataSource[]>> {
    const dashboard = await Dashboard.findOne({ shareId, shareEnabled: true });

    if (!dashboard) {
      return toApiError("Dashboard non trouvé ou non partagé.", 404);
    }

    const widgetIds = dashboard.layout.map((item: any) => item.widgetId);

    const widgets = await Widget.find({ widgetId: { $in: widgetIds } }).lean();

    const dataSourceIds = [
      ...new Set(
        widgets.map((w: any) => w.dataSourceId).filter((id: any) => !!id)
      ),
    ];

    const sources = (await DataSource.find({
      _id: { $in: dataSourceIds },
    }).lean()) as IDataSource[];

    return toApiSuccess(sources);
  },
};

export default dashboardService;
