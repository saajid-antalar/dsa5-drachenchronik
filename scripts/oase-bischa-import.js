Hooks.once("ready", () => {
  const pack = game.packs.get("dsa5-drachenchronik.oase-bischa");
  if (!pack || pack.documentName !== "Scene") return;

  let folderPromise;
  const getTargetFolder = () => {
    if (!folderPromise) {
      folderPromise = (async () => {
        let folder = game.folders.find((entry) => entry.type === "Scene" && entry.name === "Drachenchronik");
        if (!folder) folder = await Folder.create({ name: "Drachenchronik", type: "Scene", sorting: "a" });
        return folder;
      })();
    }
    return folderPromise;
  };

  const importAll = pack.importAll.bind(pack);
  pack.importAll = async (options = {}) => {
    const folder = await getTargetFolder();
    return importAll({ ...options, folderId: folder.id, folderName: undefined });
  };

  const importDocument = pack.importDocument.bind(pack);
  pack.importDocument = async (document, options = {}) => {
    const folder = await getTargetFolder();
    const data = typeof document?.toObject === "function" ? document.toObject() : foundry.utils.deepClone(document);
    data.folder = folder.id;
    return importDocument(data, options);
  };
});
