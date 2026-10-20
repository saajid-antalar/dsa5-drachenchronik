/*
 * DSA5 – Drachenchronik
 * Tagesereignis-Generator für die Khôm
 * Foundry VTT V14 / DSA5 8.1.x
 */

const MODULE_ID = "dsa5-drachenchronik";
const SETTING_KEY = "lastEventDate";
const SOCKET_NAME = `module.${MODULE_ID}`;

// ------------------------------------------------------------
// Ereignisse
// ------------------------------------------------------------
const EVENTS = [
  // 30 x Atmosphäre
  {cat:"Atmosphäre", weight:30, text:"In einiger Entfernung kreisen mehrere Geier über einem Punkt in der Wüste. Ob dort etwas Verwertbares liegt, ist aus der Entfernung nicht zu erkennen."},
  {cat:"Atmosphäre", weight:30, text:"Frische Kamelspuren kreuzen euren Weg. Die Karawane, die sie hinterlassen hat, kann noch nicht lange vorbei sein."},
  {cat:"Atmosphäre", weight:30, text:"Ein Wüstenfuchs beobachtet die Gruppe aus sicherer Entfernung und verschwindet lautlos zwischen den Dünen."},
  {cat:"Atmosphäre", weight:30, text:"Eine Feder liegt ungewöhnlich sauber auf dem Sand. Kein Vogel ist in der Nähe zu sehen."},
  {cat:"Atmosphäre", weight:30, text:"Ihr findet die Reste eines alten, längst erloschenen Lagerfeuers."},
  {cat:"Atmosphäre", weight:30, text:"Ein Windstoß treibt feinen Sand über eure Fußspuren und löscht sie innerhalb weniger Augenblicke aus."},
  {cat:"Atmosphäre", weight:30, text:"Am Horizont ist für kurze Zeit eine Staubfahne zu sehen. Ob Menschen, Tiere oder nur der Wind die Ursache sind, bleibt unklar."},
  {cat:"Atmosphäre", weight:30, text:"Mehrere kleine Käfer bewegen sich erstaunlich zielstrebig über den Sand."},
  {cat:"Atmosphäre", weight:30, text:"Die Gruppe entdeckt einen ungewöhnlich großen Abdruck im Sand, der keiner bekannten Kamelspur gleicht."},
  {cat:"Atmosphäre", weight:30, text:"Ein Schwarm kleiner Wüstenvögel zieht über euch hinweg."},
  {cat:"Atmosphäre", weight:30, text:"Zwischen zwei Dünen ragt ein halb vergrabenes Stück Holz aus dem Sand."},
  {cat:"Atmosphäre", weight:30, text:"Der Wind ändert seine Richtung und trägt für einige Minuten einen kaum wahrnehmbaren Geruch von Rauch heran."},
  {cat:"Atmosphäre", weight:30, text:"In der Ferne sind kurze, dumpfe Geräusche zu hören. Sie könnten von Kamelen stammen – oder von etwas anderem."},
  {cat:"Atmosphäre", weight:30, text:"Eine ungewöhnlich klare Nacht kündigt sich an; die Sterne wirken geradezu greifbar nah."},
  {cat:"Atmosphäre", weight:30, text:"Eine kleine Eidechse huscht zwischen den Steinen hervor und bleibt reglos sitzen, bis die Gruppe weiterzieht."},
  {cat:"Atmosphäre", weight:30, text:"Ein alter Wegweiser aus Holz liegt umgestürzt im Sand. Seine Beschriftung ist fast vollständig verwittert."},
  {cat:"Atmosphäre", weight:30, text:"Ihr findet mehrere kleine Steine, die offenbar von Menschen in einer Linie abgelegt wurden."},
  {cat:"Atmosphäre", weight:30, text:"Der Sand bildet ungewöhnlich regelmäßige Wellen, die wie die Linien einer Landkarte wirken."},
  {cat:"Atmosphäre", weight:30, text:"Ein einzelner großer Vogel sitzt lange auf einem Felsen und beobachtet die Karawane."},
  {cat:"Atmosphäre", weight:30, text:"Eine kleine Pflanze hat sich durch eine besonders feuchte Stelle im Sand gekämpft."},
  {cat:"Atmosphäre", weight:30, text:"Ihr entdeckt die Überreste eines alten Lederriemens, der möglicherweise zu einem Reittier gehörte."},
  {cat:"Atmosphäre", weight:30, text:"In der Ferne scheint ein heller Stofffetzen über dem Sand zu flattern. Bei näherer Betrachtung ist es nur ein Stück altes Tuch."},
  {cat:"Atmosphäre", weight:30, text:"Eine Reihe kleiner Löcher im Sand verrät, dass sich darunter vermutlich Tiere verstecken."},
  {cat:"Atmosphäre", weight:30, text:"Ein kurzer Regenschauer hat eine entfernte Felswand dunkel gefärbt, obwohl bei euch kein Tropfen gefallen ist."},
  {cat:"Atmosphäre", weight:30, text:"Ihr stoßt auf einen kleinen Kreis aus Steinen. Wer ihn angelegt hat und warum, ist nicht ersichtlich."},
  {cat:"Atmosphäre", weight:30, text:"Ein paar Knochen liegen sauber abgenagt im Sand. Sie stammen offenbar von einem mittelgroßen Tier."},
  {cat:"Atmosphäre", weight:30, text:"Eine Kamelspinne flüchtet vor den Schatten der Gruppe."},
  {cat:"Atmosphäre", weight:30, text:"Am Abend färbt sich der Himmel ungewöhnlich tiefrot."},
  {cat:"Atmosphäre", weight:30, text:"Ein Windstoß bringt das entfernte Rufen eines unbekannten Tieres mit sich."},
  {cat:"Atmosphäre", weight:30, text:"Ihr findet eine kleine, vollkommen trockene Muschel im Sand – weit entfernt von jeder bekannten Wasserstelle."},

  // 25 x kleines Ereignis
  {cat:"Kleines Ereignis", weight:25, text:"Eine alte Karawanenspur führt plötzlich von eurem Weg ab und verschwindet hinter einer Düne."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein Teil einer alten Wagenachse ragt aus dem Sand. Das Holz ist fast vollständig zerfallen."},
  {cat:"Kleines Ereignis", weight:25, text:"Die Gruppe entdeckt eine kleine, versteckte Wasserstelle. Sie reicht gerade für eine kurze Rast."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein einsamer Reisender taucht am Horizont auf und bittet um etwas Wasser."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein verletzter Wüstenvogel kann nicht mehr fliegen und benötigt Hilfe oder wird zur leichten Beute eines Räubers."},
  {cat:"Kleines Ereignis", weight:25, text:"Unter einer dünnen Sandschicht findet sich ein alter, leerer Wasserschlauch."},
  {cat:"Kleines Ereignis", weight:25, text:"Eine kleine Gruppe Nomaden zieht in einiger Entfernung vorbei und beobachtet euch aufmerksam."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein Kamel scheut plötzlich vor einem völlig unscheinbaren Fleck Sand."},
  {cat:"Kleines Ereignis", weight:25, text:"Die Gruppe findet ein altes Messer, das stark verrostet, aber noch brauchbar ist."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein halb vergrabener Tonkrug wird entdeckt. Er ist leer, trägt aber fremdartige Verzierungen."},
  {cat:"Kleines Ereignis", weight:25, text:"Ihr entdeckt eine kleine Ruine, kaum mehr als einige Mauerreste, die aus dem Sand ragen."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein Schwarm Insekten zieht auf die Karawane zu und verschwindet ebenso schnell wieder."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein alter Lagerplatz zeigt Spuren, dass hier vor wenigen Tagen jemand gerastet haben muss."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein Nomade warnt euch aus der Entfernung vor einem Gebiet, das er als gefährlich bezeichnet."},
  {cat:"Kleines Ereignis", weight:25, text:"Eine kleine Felsnische bietet einen überraschend guten Rastplatz vor der Sonne."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein Kamel findet zwischen trockenem Gestrüpp etwas Fressbares und lässt sich nur widerwillig davon wegführen."},
  {cat:"Kleines Ereignis", weight:25, text:"Die Gruppe entdeckt eine ungewöhnliche Spur, die nach wenigen Schritt abrupt endet."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein fremdartiger Anhänger liegt im Sand. Er wirkt alt, ist aber erstaunlich gut erhalten."},
  {cat:"Kleines Ereignis", weight:25, text:"In einer Senke finden sich zahlreiche Tierknochen. Offenbar ist dies ein regelmäßig genutzter Futterplatz eines Räubers."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein entferntes Kamelgeschrei führt zu einem Tier, das sich von seiner kleinen Karawane entfernt hat."},
  {cat:"Kleines Ereignis", weight:25, text:"Eine alte Münze wird im Sand gefunden. Das Prägezeichen ist stark abgenutzt."},
  {cat:"Kleines Ereignis", weight:25, text:"Ihr stoßt auf einen schmalen Pfad zwischen zwei Felsformationen, der auf keiner bekannten Route verzeichnet ist."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein Stück Stoff mit einem unbekannten Wappen hängt an einem Dornbusch."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein kleines Rudel Wüstenhunde hält Abstand und folgt der Gruppe eine Weile."},
  {cat:"Kleines Ereignis", weight:25, text:"Ein alter Pfeil steckt in einem Felsen. Das Holz ist verwittert, die Spitze jedoch erstaunlich gut erhalten."},

  // 17 x Reiseproblem
  {cat:"Reiseproblem", weight:17, text:"Ein Kamel lahmt. Die Ursache ist zunächst nicht eindeutig und muss untersucht werden."},
  {cat:"Reiseproblem", weight:17, text:"Ein Wasserschlauch ist undicht geworden. Ein Teil des kostbaren Wassers geht verloren."},
  {cat:"Reiseproblem", weight:17, text:"Ein Packriemen reißt. Gepäck muss neu befestigt und überprüft werden."},
  {cat:"Reiseproblem", weight:17, text:"Der Wind verweht einen kleinen Ausrüstungsgegenstand. Er liegt vermutlich noch irgendwo in der unmittelbaren Umgebung."},
  {cat:"Reiseproblem", weight:17, text:"Eine Kamelbeladung verrutscht. Die Reise muss kurz unterbrochen werden."},
  {cat:"Reiseproblem", weight:17, text:"Die Orientierung wird schwierig, weil ein markanter Dünenzug anders aussieht als erwartet."},
  {cat:"Reiseproblem", weight:17, text:"Ein Kamel weigert sich hartnäckig, weiterzugehen, und muss beruhigt oder untersucht werden."},
  {cat:"Reiseproblem", weight:17, text:"Feiner Sand hat sich in Verschlüsse und Ausrüstung gesetzt. Einige Dinge müssen gereinigt werden."},
  {cat:"Reiseproblem", weight:17, text:"Eine Rast dauert länger als geplant, weil ein Tier versorgt werden muss."},
  {cat:"Reiseproblem", weight:17, text:"Ein Gepäckstück wird vermisst. Es muss geklärt werden, ob es verloren ging oder falsch verstaut wurde."},
  {cat:"Reiseproblem", weight:17, text:"Die Gruppe stößt auf ein Gebiet mit besonders tiefem, losem Sand. Das Vorankommen wird deutlich langsamer."},
  {cat:"Reiseproblem", weight:17, text:"Eine Düne zwingt die Gruppe zu einem Umweg."},
  {cat:"Reiseproblem", weight:17, text:"Ein Tier zeigt Anzeichen von Erschöpfung und braucht eine längere Pause."},
  {cat:"Reiseproblem", weight:17, text:"Ein Teil der Vorräte wurde durch die Hitze beschädigt."},
  {cat:"Reiseproblem", weight:17, text:"Eine Sandböe drückt Sand in Augen, Mund und Ausrüstung. Die Gruppe muss kurz Schutz suchen."},
  {cat:"Reiseproblem", weight:17, text:"Ein wichtiger Wegpunkt ist nicht dort, wo er laut Karte sein sollte."},
  {cat:"Reiseproblem", weight:17, text:"Die Tiere reagieren nervös auf einen Geruch, den die Menschen kaum wahrnehmen können."},

  // 13 x Natur
  {cat:"Natur", weight:13, text:"Ein großer Skorpion wird in unmittelbarer Nähe eines Helden entdeckt."},
  {cat:"Natur", weight:13, text:"Eine Sandviper liegt eingerollt unter einem Stein, den jemand beinahe angefasst hätte."},
  {cat:"Natur", weight:13, text:"Ein kleines Rudel Hyänen beobachtet die Gruppe aus einiger Entfernung."},
  {cat:"Natur", weight:13, text:"Mehrere Geier streiten sich lautstark um einen Kadaver."},
  {cat:"Natur", weight:13, text:"Ein ungewöhnlich großer Wüstenfuchs nähert sich der Karawane und verschwindet wieder."},
  {cat:"Natur", weight:13, text:"Eine Schlange hat sich im Schatten eines Gepäckstücks versteckt."},
  {cat:"Natur", weight:13, text:"Ein Schwarm aggressiver Insekten zieht durch das Lagergebiet."},
  {cat:"Natur", weight:13, text:"Die Tiere werden plötzlich unruhig. In der Nähe bewegt sich offenbar ein größerer Räuber."},
  {cat:"Natur", weight:13, text:"Eine große Eidechse mit auffälliger Färbung sonnt sich auf einem Felsen."},
  {cat:"Natur", weight:13, text:"Ein verletztes Raubtier zieht sich hinkend durch die Dünen."},
  {cat:"Natur", weight:13, text:"Eine Gruppe wilder Kamele kreuzt euren Weg."},
  {cat:"Natur", weight:13, text:"In einer Felsspalte nisten zahlreiche Wüstenvögel. Die Tiere verteidigen ihr Nest lautstark."},
  {cat:"Natur", weight:13, text:"Ein Tier folgt der Karawane über längere Zeit, ohne sich näher als nötig zu nähern."},

  // 8 x Wetter
  {cat:"Wetter", weight:8, text:"Am Horizont entsteht eine Sandwand. Ein Sandsturm zieht offenbar in eure Richtung."},
  {cat:"Wetter", weight:8, text:"Starker Wind setzt ein und zwingt die Gruppe, Kleidung und Ausrüstung zu sichern."},
  {cat:"Wetter", weight:8, text:"Eine ungewöhnlich kalte Nacht steht bevor. Die Temperaturen fallen deutlich stärker als erwartet."},
  {cat:"Wetter", weight:8, text:"Eine plötzliche Staubwolke verschlechtert für einige Zeit die Sicht."},
  {cat:"Wetter", weight:8, text:"In der Ferne entlädt sich ein Gewitter über den Bergen. Donner ist noch lange zu hören."},
  {cat:"Wetter", weight:8, text:"Ein kurzer, heftiger Regenguss trifft die Gruppe. Der Boden verwandelt sich stellenweise in zähen Schlamm."},
  {cat:"Wetter", weight:8, text:"Eine Hitzewelle macht den Tagesmarsch erheblich anstrengender."},
  {cat:"Wetter", weight:8, text:"Dichte Wolken ziehen auf und verändern die Orientierung nach den Sternen in der folgenden Nacht."},

  // 5 x Gefahr
  {cat:"Gefahr", weight:5, text:"Ein Rudel Hyänen nähert sich der Karawane. Sie testen vorsichtig die Reaktion der Gruppe."},
  {cat:"Gefahr", weight:5, text:"Mehrere bewaffnete Reiter sind in einiger Entfernung zu erkennen und ändern offenbar ihren Kurs in eure Richtung."},
  {cat:"Gefahr", weight:5, text:"Eine Sandviper greift aus dem Versteck an, als jemand eine besonders schattige Stelle betritt."},
  {cat:"Gefahr", weight:5, text:"Die Gruppe entdeckt deutliche Spuren eines großen Raubtiers. Die Spuren sind frisch."},
  {cat:"Gefahr", weight:5, text:"Hinter einer Düne findet ihr die Überreste eines verlassenen Lagers. Mehrere Spuren deuten auf einen gewaltsamen Zwischenfall hin."},

  // 1 x schwere Gefahr
  {cat:"Schwere Gefahr", weight:1, text:"Eine größere Gruppe bewaffneter Wüstenräuber taucht auf und versucht, die Karawane einzukreisen."},

  // 1 x mystisch
  {cat:"Mystisch", weight:1, text:"Für einige Augenblicke scheint am Horizont eine Oase mit Palmen und Wasser zu liegen. Als die Gruppe den Blick abwendet und wieder hinsieht, ist nichts mehr davon zu erkennen."}
];

function weightedPick(items) {
  const total = items.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items.at(-1);
}

function getDateComponents() {
  try {
    if (game.time?.components) return game.time.components;
  } catch (err) {
    console.warn(`[${MODULE_ID}] Konnte game.time.components nicht lesen.`, err);
  }
  return null;
}

function getDateKey() {
  const c = getDateComponents();
  if (!c) return `world-${Math.floor(game.time.worldTime / 86400)}`;
  return `${c.year}-${c.month}-${c.day}`;
}

function getDateLabel() {
  const c = getDateComponents();
  try {
    const cal = game.time.calendar;
    if (cal?.format) {
      const formatted = cal.format(game.time.worldTime, "full");
      if (formatted) return formatted;
    }
  } catch (err) {
    console.warn(`[${MODULE_ID}] Kalenderformat konnte nicht ermittelt werden.`, err);
  }
  if (c) return `${c.day}. Monat ${c.month}, Jahr ${c.year}`;
  return `Welttag ${Math.floor(game.time.worldTime / 86400)}`;
}

function getPartyActors() {
  const actors = new Map();
  for (const user of game.users) {
    if (user.isGM || !user.character) continue;
    actors.set(user.character.id, user.character);
  }
  return [...actors.values()];
}

function getTarget() {
  const actors = getPartyActors();
  if (!actors.length) return {scope:"Gesamte Gruppe", actor:null};
  // 1-5: Einzelheld, 6: gesamte Gruppe
  const roll = Math.ceil(Math.random() * 6);
  if (roll === 6) return {scope:"Gesamte Gruppe", actor:null};
  const actor = actors[Math.floor(Math.random() * actors.length)];
  return {scope:"Einzelner Held", actor};
}

async function showGMResult(result) {
  if (!game.user.isGM) return;

  const targetText = result.target.actor
    ? `${result.target.actor.name}`
    : result.target.scope;

  const html = `
    <div style="min-width:420px">
      <h2 style="margin:0 0 8px">☀️ DrachenChronik – Tagesereignis</h2>
      <p><strong>Aventurischer Tag:</strong> ${foundry.utils.escapeHTML(result.dateLabel)}</p>
      <p><strong>Ausgelöst von:</strong> ${foundry.utils.escapeHTML(result.triggeredBy)}</p>
      <p><strong>Kategorie:</strong> ${foundry.utils.escapeHTML(result.event.cat)}</p>
      <p><strong>Betroffen:</strong> ${foundry.utils.escapeHTML(targetText)}</p>
      <hr>
      <p style="font-size:1.1em"><strong>${foundry.utils.escapeHTML(result.event.text)}</strong></p>
    </div>`;

  try {
    await foundry.applications.api.DialogV2.wait({
      window: {title: "DrachenChronik – Tagesereignis"},
      content: html,
      buttons: [{action:"ok", label:"Verstanden", default:true}]
    });
  } catch (err) {
    console.error(`[${MODULE_ID}] GM-Popup konnte nicht geöffnet werden.`, err);
  }

  const whisperIds = game.users.filter(u => u.isGM).map(u => u.id);
  await ChatMessage.create({
    content: `<h3>☀️ DrachenChronik – Tagesereignis</h3>
      <p><strong>Aventurischer Tag:</strong> ${foundry.utils.escapeHTML(result.dateLabel)}</p>
      <p><strong>Ausgelöst von:</strong> ${foundry.utils.escapeHTML(result.triggeredBy)}</p>
      <p><strong>Kategorie:</strong> ${foundry.utils.escapeHTML(result.event.cat)}</p>
      <p><strong>Betroffen:</strong> ${foundry.utils.escapeHTML(targetText)}</p>
      <p><strong>Ereignis:</strong> ${foundry.utils.escapeHTML(result.event.text)}</p>`,
    whisper: whisperIds
  });
}

let requestQueue = Promise.resolve();

async function processRequest(userId) {
  if (!game.user.isGM) return;

  const user = game.users.get(userId);
  if (!user) return;

  const currentDate = getDateKey();
  const lastDate = game.settings.get(MODULE_ID, SETTING_KEY);

  if (lastDate === currentDate) {
    game.socket.emit(SOCKET_NAME, {
      action: "already-used",
      userId,
      dateLabel: getDateLabel()
    });
    return;
  }

  const event = weightedPick(EVENTS);
  const target = getTarget();
  const result = {
    dateLabel: getDateLabel(),
    triggeredBy: user.name,
    event,
    target
  };

  // Weltweit speichern: ab diesem Zeitpunkt ist der aktuelle aventurische Tag verbraucht.
  await game.settings.set(MODULE_ID, SETTING_KEY, currentDate);

  // Ergebnis ausschließlich an die GMs schicken.
  await showGMResult(result);
}

function triggerFromPlayer() {
  if (game.user.isGM) {
    requestQueue = requestQueue.then(() => processRequest(game.user.id));
    return;
  }
  game.socket.emit(SOCKET_NAME, {
    action: "request",
    userId: game.user.id
  });
}

async function resetEvent() {
  if (!game.user.isGM) {
    ui.notifications.warn("Nur der Spielleiter kann den Tagesereignis-Status zurücksetzen.");
    return;
  }
  await game.settings.set(MODULE_ID, SETTING_KEY, "");
  ui.notifications.info("DrachenChronik: Tagesereignis-Sperre zurückgesetzt.");
}

function createOrUpdateMacro({name, command, img, defaultOwnership}) {
  const existing = game.macros.getName(name);
  if (existing) {
    const updates = {};
    if (existing.command !== command) updates.command = command;
    if (existing.type !== "script") updates.type = "script";
    if (existing.ownership?.default !== defaultOwnership) {
      updates.ownership = {...existing.ownership, default: defaultOwnership};
    }
    return Object.keys(updates).length ? existing.update(updates) : existing;
  }

  return Macro.create({
    name,
    type: "script",
    scope: "global",
    img,
    command,
    ownership: {default: defaultOwnership}
  });
}

async function ensureMacros() {
  if (!game.user.isGM) return;

  const observer = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
  const none = CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;

  await createOrUpdateMacro({
    name: "☀️ Tagesereignis",
    img: "icons/sundries/flags/banner-symbol-sun-gold.webp",
    defaultOwnership: observer,
    command: `game.modules.get("${MODULE_ID}")?.api?.trigger();`
  });

  await createOrUpdateMacro({
    name: "☀️ Tagesereignis – GM Reset",
    img: "icons/svg/refresh.svg",
    defaultOwnership: none,
    command: `game.modules.get("${MODULE_ID}")?.api?.reset();`
  });
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, SETTING_KEY, {
    name: "Letzter Tagesereignis-Tag",
    hint: "Interner, weltweiter Status des Tagesereignis-Generators.",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.modules.get(MODULE_ID).api = {
    trigger: triggerFromPlayer,
    reset: resetEvent,
    events: EVENTS
  };
});

Hooks.once("ready", async () => {
  game.socket.on(SOCKET_NAME, data => {
    if (!data?.action) return;

    if (data.action === "request") {
      if (!game.user.isGM) return;
      requestQueue = requestQueue
        .then(() => processRequest(data.userId))
        .catch(err => console.error(`[${MODULE_ID}] Fehler bei Tagesereignis:`, err));
      return;
    }

    if (data.action === "already-used" && data.userId === game.user.id) {
      ui.notifications.info(`Für ${data.dateLabel} wurde bereits ein Tagesereignis ausgelöst.`);
    }
  });

  if (game.user.isGM) {
    await ensureMacros();
    console.log(`[${MODULE_ID}] Tagesereignis-System bereit. Aktueller Tag: ${getDateLabel()}`);
  }
});
