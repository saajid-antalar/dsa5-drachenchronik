const MODULE_ID = "dsa5-drachenchronik";

const EVENTS = [
  ["Flimmernde Luft", "Ein Hitzeschleier lässt Entfernungen und Umrisse täuschen. Orientierung und Fernsicht sind bis zum Abend erschwert."],
  ["Sand in den Vorräten", "Feiner Wüstensand ist in Wasser und Proviant geraten. Die Gruppe muss Vorräte prüfen und neu sichern."],
  ["Spuren im Dünenschatten", "Frische Spuren kreuzen den Weg. Sie stammen von einem einzelnen Wanderer oder einem Tier; ihre Verfolgung kostet Zeit."],
  ["Verirrte Karawane", "Eine kleine Karawane sucht den Weg zu einer bekannten Oase und bietet Neuigkeiten im Austausch gegen Hilfe."],
  ["Windstoß", "Ein plötzlich auffrischender Wind zwingt dazu, Zelte, Tücher und Ausrüstung zu sichern."],
  ["Kreislauf der Geier", "Geier kreisen über einer Senke. Dort liegt ein verlassenes Lager oder ein verletztes Tier."],
  ["Falsche Fata Morgana", "Am Horizont scheint Wasser zu glitzern. Wer die Täuschung erkennt, kann dennoch eine brauchbare Landmarke entdecken."],
  ["Alte Wegmarke", "Unter Sand wird eine verwitterte aventurische Wegmarke sichtbar. Sie weist auf einen vergessenen Pfad."],
  ["Nächtliche Laute", "In der Nacht sind Rufe oder Klagen aus der Dunkelheit zu hören. Am Morgen finden sich Spuren nahe dem Lager."],
  ["Kleine Oase", "Eine verborgene Quelle spendet knappes Wasser und einen geschützten Rastplatz. Ihre Umgebung wirkt ungewöhnlich still."],
  ["Wüstenfuchs", "Ein abgemagerter Wüstenfuchs nähert sich dem Lager. Er ist scheu, trägt aber etwas Auffälliges im Fell."],
  ["Staubige Böe", "Eine Böe wirbelt Staub auf und zwingt Reisende, Augen und Atemwege zu schützen. Danach ist ein Gegenstand verschwunden."],
  ["Sternklarer Himmel", "Die Nacht ist außergewöhnlich klar. Sternbilder geben eine sichere Orientierung und offenbaren eine seltene Konstellation."],
  ["Riss im Boden", "Ein kaum sichtbarer Spalt liegt quer über dem Weg. Darunter finden sich Spuren eines alten Hohlraums."],
  ["Händler auf Abwegen", "Ein einzelner Händler ist vom Weg abgekommen. Er kann mit Gerüchten, Waren oder einer ungewöhnlichen Bitte helfen."],
  ["Unruhige Reittiere", "Reittiere wittern etwas und werden nervös. In der Nähe gibt es ein Tier, eine Gefahr oder eine ungewöhnliche Spur."],
  ["Verlassene Feuerstelle", "Eine noch warme Feuerstelle deutet auf Reisende hin, die erst vor kurzem aufgebrochen sind."],
  ["Wüstenblüten", "Nach seltenem Regen blühen Pflanzen in einer Senke. Sie bieten Nahrung oder eine heilkundige Gelegenheit."],
  ["Schwarzer Stein", "Ein dunkler Stein steckt halb im Sand und trägt rätselhafte Zeichen. Seine Herkunft ist unklar."],
  ["Stille des Tages", "Der Tag verläuft ohne besondere Begegnung. Die Ruhe erlaubt eine sichere Rast und sorgfältige Versorgung."]
];

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "usedAventurianDays", {
    name: "Bereits verwendete Aventurientage",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
  game.settings.registerMenu(MODULE_ID, "dailyEventMenu", {
    name: "Tagesereignis der Khôm",
    label: "Tagesereignis auslösen",
    hint: "Würfelt einmal pro Aventurientag ein Ereignis aus. Ausgabe sehen nur Spielleitungen.",
    icon: "fas fa-sun",
    type: DailyEventDialog,
    restricted: true
  });
});

class DailyEventDialog extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "drachenchronik-daily-event",
      title: "Tagesereignis der Khôm",
      template: `modules/${MODULE_ID}/templates/daily-event.html`,
      width: 440,
      closeOnSubmit: true
    });
  }

  getData() {
    const usedDays = game.settings.get(MODULE_ID, "usedAventurianDays");
    const lastDay = Object.keys(usedDays).at(-1) ?? "";
    return { lastDay };
  }

  async _updateObject(_event, formData) {
    const day = String(formData.day ?? "").trim().replace(/\s+/g, " ");
    if (!day) return ui.notifications.warn("Bitte den aventurischen Kalendertag eintragen.");
    const dayKey = day.normalize("NFKC").toLocaleLowerCase("de").replace(/[.,]/g, "").replace(/\s+/g, " ");

    const usedDays = game.settings.get(MODULE_ID, "usedAventurianDays");
    if (usedDays[dayKey]) {
      return ui.notifications.warn(`Für ${day} wurde bereits ein Tagesereignis ausgelöst.`);
    }

    // Record this calendar day before asynchronous work so it cannot be rerolled later.
    usedDays[dayKey] = day;
    await game.settings.set(MODULE_ID, "usedAventurianDays", usedDays);

    const roll = await (new Roll("1d20")).evaluate();
    const index = Math.clamp(Number(roll.total) - 1, 0, EVENTS.length - 1);
    const [title, description] = EVENTS[index];
    const characters = game.actors.filter(actor => actor.hasPlayerOwner && actor.type !== "vehicle");
    const targetActor = characters.length ? characters[Math.floor(Math.random() * characters.length)] : null;
    const affectsHero = Boolean(targetActor) && Math.random() < 0.5;
    const target = affectsHero ? `Einzelheld: ${foundry.utils.escapeHTML(targetActor.name)}` : "Die ganze Gruppe";

    const content = `
      <h2>Tagesereignis der Khôm</h2>
      <p><strong>Aventurientag:</strong> ${foundry.utils.escapeHTML(day)}</p>
      <p><strong>Wurf:</strong> ${roll.total} (1W20)</p>
      <p><strong>${foundry.utils.escapeHTML(title)}</strong></p>
      <p>${foundry.utils.escapeHTML(description)}</p>
      <p><strong>Betroffen:</strong> ${target}</p>`;

    const gmIds = game.users.filter(user => user.isGM).map(user => user.id);
    await ChatMessage.create({
      content,
      whisper: gmIds,
      speaker: ChatMessage.getSpeaker({ alias: "Drachenchronik" })
    });
    new Dialog({
      title: "Tagesereignis der Khôm",
      content,
      buttons: { close: { label: "Schließen" } },
      default: "close"
    }).render(true);
  }
}
