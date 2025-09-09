import Widget from "../models/Widget";
import Dashboard from "../models/Dashboard";
import type {
  IWidget,
  WidgetCreatePayload,
  WidgetUpdatePayload,
} from "../types/widgetType";
import type { ApiResponse } from "../types/api";
import { toApiData, toApiError } from "../utils/api";
import { generateUUID } from "../utils/uuidGenerator";

/**
 * Service pour gérer les opérations liées aux widgets.
 * Permet de créer, lire, mettre à jour et supprimer des widgets,
 * ainsi que de lister les widgets d'un utilisateur ou publics.
 * @module widgetService
 */
const widgetService = {

  /**
   * Crée un nouveau widget avec les données fournies.
   * @param {WidgetCreatePayload} payload - Les données du widget à créer.
   * @returns {Promise<ApiResponse<IWidget>>} - La réponse contenant le widget créé.
   */
  async create(payload: WidgetCreatePayload): Promise<ApiResponse<IWidget>> {
    const { title, type, dataSourceId, config, userId } = payload;

    if (!title || !type || !dataSourceId || !userId) {
      return toApiError("Champs requis manquants.", 400);
    }
    const widgetId = generateUUID(true, 8, true, "widget-");

    const widget = await Widget.create({
      widgetId,
      title,
      type,
      dataSourceId,
      config,
      ownerId: userId,
      history: [
        {
          userId,
          date: new Date(),
          action: "create",
          changes: { widgetId, title, type, dataSourceId, config },
        },
      ],
    });

    return toApiData(widget);
  },


  /**
   * Liste les widgets d'un utilisateur ou tous les widgets publics.
   * Vérifie également si chaque widget est utilisé dans au moins un dashboard.
   * @param {string} [userId] - L'ID de l'utilisateur pour filtrer les widgets.
   * @returns {Promise<ApiResponse<IWidget[]>>} - La réponse contenant la liste des widgets.
   */
  async list(userId?: string): Promise<ApiResponse<IWidget[]>> {
    const widgets = await Widget.find({
      $or: [{ ownerId: userId }, { visibility: "public" }],
    });

    const widgetsWithUsage = await Promise.all(
      widgets.map(async (w) => {
        const count = await Dashboard.countDocuments({
          layout: { $elemMatch: { widgetId: w.widgetId } },
        });

        return { ...w.toObject(), isUsed: count > 0 };
      })
    );

    return toApiData(widgetsWithUsage);
  },


  /**
   * Récupère un widget par son ID.
   * @param {string} id - L'ID du widget à récupérer.
   * @returns {Promise<ApiResponse<IWidget>>} - La réponse contenant le widget trouvé.
  */
  async getById(id: string): Promise<ApiResponse<IWidget>> {
    const widget = await Widget.findById(id);

    if (!widget) {
      return toApiError("Widget non trouvé.", 404);
    }

    return toApiData(widget);
  },


  /**
   * Met à jour un widget existant avec les données fournies.
   * Enregistre l'historique des modifications si un userId est fourni.
   * @param {string} id - L'ID du widget à mettre à jour.
   * @param {WidgetUpdatePayload} body - Les données de mise à jour du widget.
   * @returns {Promise<ApiResponse<IWidget>>} - La réponse contenant le widget mis à jour.
   */
  async update(
    id: string,
    body: WidgetUpdatePayload
  ): Promise<ApiResponse<IWidget>> {
    const widget = await Widget.findById(id);

    if (!widget) {
      return toApiError("Widget non trouvé.", 404);
    }

    const old = widget.toObject() as unknown as Record<string, unknown>;

    const changes: Record<string, { before: unknown; after: unknown }> = {};

    for (const key of [
      "title",
      "type",
      "dataSourceId",
      "config",
      "visibility",
    ] as const) {
      if (body[key] !== undefined && body[key] !== old[key]) {
        changes[key] = { before: old[key], after: body[key] };
      }
    }

    if (Object.keys(changes).length > 0 && body.userId) {
      if (!widget.history) widget.history = [];

      widget.history.push({
        userId: body.userId,
        date: new Date(),
        action: "update",
        changes,
      });
    }

    Object.assign(widget, body);

    await widget.save();

    return toApiData(widget);
  },


  /**
   * Supprime un widget par son ID.
   * Vérifie d'abord s'il est utilisé dans un dashboard.
   * @param {string} id - L'ID du widget à supprimer.
   * @returns {Promise<ApiResponse<{ success: boolean }>>} - La réponse indiquant si la suppression a réussi.
   */
  async remove(id: string): Promise<ApiResponse<{ success: boolean }>> {
    const widget = await Widget.findById(id);

    if (!widget) {
      return toApiError("Widget non trouvé.", 404);
    }

    const count = await Dashboard.countDocuments({
      layout: { $elemMatch: { widgetId: widget.widgetId } },
    });

    if (count > 0) {
      return toApiError(
        "Impossible de supprimer un widget utilisé dans un dashboard.",
        400
      );
    }

    await Widget.findByIdAndDelete(id);

    return toApiData({ success: true });
  },


};

export default widgetService;
