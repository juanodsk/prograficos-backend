export const emitProductionChange = (req, event, payload = {}) => {
  if (!req?.io) return;

  const message = {
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  req.io.emit(event, message);
  req.io.emit("production:changed", message);
};
