import {
  createQuotation as createQuotationService,
  listQuotations as listQuotationsService,
  getQuotationById as getQuotationByIdService,
  updateQuotation as updateQuotationService,
  deleteQuotation as deleteQuotationService,
  markQuotationAsSent as markQuotationAsSentService,
} from "./quotation.service.js";

// Controller delgado: coordina request → service → respuesta. El contrato
// { status, message, data, meta } es el mismo del resto de la API.

export const createQuotation = async (req, res) => {
  try {
    const result = await createQuotationService(req.body, req.user?.id ?? null);
    if (result.error) {
      return res.status(400).json({ status: "error", message: result.error });
    }
    return res.status(201).json({
      status: "success",
      message: "Cotización creada exitosamente",
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Error al crear la cotización" });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const { data, meta } = await listQuotationsService(req.query);
    return res.status(200).json({
      status: "success",
      message: "Cotizaciones obtenidas exitosamente",
      data,
      meta,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Error al obtener las cotizaciones" });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    const quotation = await getQuotationByIdService(req.params.id);
    if (!quotation) {
      return res
        .status(404)
        .json({ status: "error", message: "Cotización no encontrada" });
    }
    return res.status(200).json({
      status: "success",
      message: "Cotización obtenida exitosamente",
      data: quotation,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Error al obtener la cotización" });
  }
};

export const updateQuotation = async (req, res) => {
  try {
    const result = await updateQuotationService(req.params.id, req.body);
    if (result.error) {
      const status = result.notFound ? 404 : 400;
      return res.status(status).json({ status: "error", message: result.error });
    }
    return res.status(200).json({
      status: "success",
      message: "Cotización actualizada exitosamente",
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Error al actualizar la cotización" });
  }
};

export const sendQuotation = async (req, res) => {
  try {
    const result = await markQuotationAsSentService(req.params.id);
    if (result.error) {
      const status = result.notFound ? 404 : 400;
      return res.status(status).json({ status: "error", message: result.error });
    }
    return res.status(200).json({
      status: "success",
      message: "Cotización marcada como enviada",
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Error al enviar la cotización" });
  }
};

export const deleteQuotation = async (req, res) => {
  try {
    const result = await deleteQuotationService(req.params.id);
    if (result.error) {
      const status = result.notFound ? 404 : 400;
      return res.status(status).json({ status: "error", message: result.error });
    }
    return res.status(200).json({
      status: "success",
      message: "Cotización eliminada exitosamente",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Error al eliminar la cotización" });
  }
};
