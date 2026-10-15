import type { LearnModule } from "../types";
import { LANDFORMS, SOLAR_SYSTEM } from "./g-extra";

export const G01_PHYSICAL: LearnModule = {
  id: "physical",
  title: "Physical geography: the Earth",
  titleHi: "भौतिक भूगोल: पृथ्वी",
  blurb: "The universe and solar system, the Earth's movements, latitudes and time, what is inside the Earth, landforms, the atmosphere and the oceans.",
  lessons: [
    SOLAR_SYSTEM,
    {
      id: "earth-time",
      title: "Earth, latitudes, longitudes & time",
      oneLine: "Latitudes tell you how far north or south a place is; longitudes tell you how far east or west — and longitudes also decide the local time.",
      minutes: 15,
      blocks: [
        { t: "p", text: "**The Earth in space.** The Earth is the **3rd planet** from the Sun. It is not a perfect ball: it is slightly flattened at the poles and bulges at the equator, a shape called a **geoid**. Its axis is tilted at about **23.5°**, and this tilt is the reason we have seasons." },
        {
          t: "table",
          head: ["Movement", "Takes", "Causes"],
          rows: [
            ["Rotation (spinning on its axis, west → east)", "About 24 hours", "Day and night"],
            ["Revolution (going round the Sun)", "About 365¼ days (so every 4th year is a leap year)", "Seasons (together with the tilt)"],
          ],
        },
        { t: "p", text: "**Latitudes** are imaginary horizontal circles. The **Equator (0°)** is the biggest and divides the Earth into the Northern and Southern Hemispheres. Important ones: **Tropic of Cancer 23.5°N**, **Tropic of Capricorn 23.5°S**, **Arctic Circle 66.5°N**, **Antarctic Circle 66.5°S**, poles at 90°." },
        { t: "p", text: "**Longitudes (meridians)** are imaginary half-circles from pole to pole. The **Prime Meridian (0°)** passes through **Greenwich, London**. There are 360 degrees of longitude; the 180° line is roughly the **International Date Line** — cross it going west and you jump a day ahead." },
        { t: "example", title: "How longitude gives time", steps: ["The Earth turns 360° in 24 hours.", "360° ÷ 24 hours = 15° per hour.", "So 1° = 60 ÷ 15 = 4 minutes.", "Places to the EAST see the Sun first, so they are AHEAD in time.", "India's standard meridian is 82.5°E → 82.5 × 4 = 330 minutes = 5 hours 30 minutes.", "So Indian Standard Time = GMT + 5:30."], answer: "1° longitude = 4 minutes; IST = GMT + 5 h 30 min" },
        { t: "p", text: "**Seasons & special days:** around **21 June** the Sun is overhead at the Tropic of Cancer — the longest day in the Northern Hemisphere (summer solstice). Around **22 December** it is overhead at the Tropic of Capricorn (winter solstice). On **21 March and 23 September** it is overhead at the Equator — day and night are equal everywhere (equinoxes). The Earth is closest to the Sun (**perihelion**) around 3 January and farthest (**aphelion**) around 4 July." },
        { t: "trap", text: "We are closest to the Sun in January — our winter! Seasons are caused by the tilt of the axis, not by the distance from the Sun." },
        {
          t: "recap",
          items: [
            "Rotation 24 h → day/night; revolution 365¼ days → seasons; axis tilt 23.5°",
            "Equator 0°, Tropics 23.5°, Arctic/Antarctic Circles 66.5°",
            "Prime Meridian 0° (Greenwich); Date Line ≈ 180°",
            "1° longitude = 4 minutes; 15° = 1 hour; IST = 82.5°E = GMT + 5:30",
            "Solstices 21 June & 22 Dec; equinoxes 21 March & 23 Sept; perihelion Jan, aphelion July",
          ],
        },
      ],
      quiz: [
        { q: "A difference of 1° of longitude equals a time difference of:", options: ["1 minute", "4 minutes", "15 minutes", "1 hour"], answer: 1, explain: "360° in 24 hours → 15° per hour → 4 minutes per degree." },
        { q: "The longest day in the Northern Hemisphere is around:", options: ["21 March", "21 June", "23 September", "22 December"], answer: 1, explain: "Summer solstice — Sun over the Tropic of Cancer." },
        { q: "If it is 12 noon at Greenwich (0°), what time is it at 30°E?", options: ["10 a.m.", "12:30 p.m.", "2 p.m.", "4 p.m."], answer: 2, explain: "30 × 4 = 120 minutes = 2 hours ahead (east) → 2 p.m." },
      ],
    },
    {
      id: "interior-landforms",
      title: "Inside the Earth, rocks, volcanoes & earthquakes",
      oneLine: "The Earth has layers like an egg; its outer shell is broken into moving plates, and their movement builds mountains and causes earthquakes and volcanoes.",
      minutes: 18,
      blocks: [
        { t: "analogy", text: "Think of a boiled egg: the thin shell is the crust, the white is the mantle, and the yolk is the core." },
        {
          t: "table",
          head: ["Layer", "Facts"],
          rows: [
            ["Crust", "Thinnest layer — about 5 km under oceans, 30–70 km under continents. Continental crust = SIAL (silica + aluminium); ocean floor = SIMA (silica + magnesium)"],
            ["Mantle", "Goes down to about 2,900 km; the upper part (asthenosphere) is partly molten — the plates float on it"],
            ["Core", "Outer core is LIQUID, inner core is SOLID; made of nickel + iron (NIFE). Hottest and densest part"],
          ],
        },
        { t: "p", text: "**Boundaries between layers:** crust | mantle = **Mohorovičić (Moho) discontinuity**; mantle | core = **Gutenberg discontinuity**. Scientists know about the interior mostly from **earthquake (seismic) waves**: P-waves travel through solids and liquids, but **S-waves cannot pass through liquids** — that is how we know the outer core is liquid." },
        {
          t: "table",
          head: ["Rock type", "Formed by", "Examples"],
          rows: [
            ["Igneous (primary rocks)", "Cooling of molten magma/lava", "Granite, basalt"],
            ["Sedimentary", "Layers of sediment pressed together — contain fossils", "Sandstone, limestone, shale, coal"],
            ["Metamorphic", "Existing rocks changed by heat and pressure", "Limestone → marble, shale → slate, sandstone → quartzite, granite → gneiss"],
          ],
        },
        { t: "p", text: "**Plate tectonics.** The Earth's outer shell (lithosphere) is broken into big **plates** that move a few centimetres every year. Where plates **collide**, fold mountains rise — the **Himalayas** formed when the Indian Plate pushed into the Eurasian Plate (and they are still rising). Where they **pull apart**, new crust forms (mid-ocean ridges). Alfred Wegener's **Continental Drift theory (1912)** said all continents were once one landmass, **Pangaea**, surrounded by the ocean **Panthalassa**." },
        { t: "p", text: "**Earthquakes** happen when rocks suddenly break and move. The point inside the Earth where it starts is the **focus (hypocentre)**; the point directly above it on the surface is the **epicentre**. Magnitude is measured on the **Richter scale**; the instrument is a **seismograph**. **Volcanoes**: the **“Ring of Fire”** around the Pacific Ocean has most active volcanoes. India's only active volcano is on **Barren Island** (Andaman & Nicobar)." },
        { t: "trap", text: "The OUTER core is liquid, the INNER core is solid. And the epicentre is on the surface — the focus is underground." },
        {
          t: "recap",
          items: [
            "Crust (SIAL/SIMA) → mantle → core (NIFE); outer core liquid, inner core solid",
            "Moho = crust/mantle; Gutenberg = mantle/core; S-waves can't pass through liquids",
            "Igneous (primary), sedimentary (fossils), metamorphic (marble, slate)",
            "Plates collide → Himalayas; Wegener 1912, Pangaea",
            "Focus underground, epicentre on surface; Richter scale; Ring of Fire; Barren Island",
          ],
        },
      ],
      quiz: [
        { q: "Marble is a metamorphic form of:", options: ["Sandstone", "Limestone", "Granite", "Shale"], answer: 1, explain: "Limestone → marble; shale → slate; sandstone → quartzite." },
        { q: "The boundary between the crust and the mantle is called the:", options: ["Gutenberg discontinuity", "Moho discontinuity", "Lehmann discontinuity", "Conrad discontinuity"], answer: 1, explain: "Mohorovičić (Moho)." },
        { q: "India's only active volcano is at:", options: ["Narcondam Island", "Barren Island", "Lakshadweep", "Majuli"], answer: 1, explain: "Barren Island, Andaman Sea." },
      ],
    },
    LANDFORMS,
    {
      id: "atmosphere-oceans",
      title: "Atmosphere, winds, cyclones & oceans",
      oneLine: "The air around the Earth has layers; differences in heating create pressure belts and winds; the oceans move in currents and tides.",
      minutes: 18,
      blocks: [
        { t: "p", text: "**What is air made of?** Nitrogen **78%**, oxygen **21%**, argon about **0.93%**, carbon dioxide about **0.04%**, plus water vapour and dust. Carbon dioxide and water vapour trap heat — the **greenhouse effect**." },
        {
          t: "table",
          head: ["Layer (from the ground up)", "Remember it for"],
          rows: [
            ["Troposphere (up to ~8 km at poles, ~18 km at equator)", "ALL weather — clouds, rain, storms; temperature falls with height"],
            ["Stratosphere (to ~50 km)", "OZONE LAYER (absorbs ultraviolet rays); calm air — good for jet planes"],
            ["Mesosphere (to ~80 km)", "Meteors burn up here; coldest layer"],
            ["Thermosphere (ionosphere)", "Reflects radio waves back to Earth; auroras"],
            ["Exosphere", "Outermost layer, merges into space"],
          ],
        },
        { t: "trick", text: "“The Strong Man Throws Eggs” = Troposphere, Stratosphere, Mesosphere, Thermosphere, Exosphere." },
        { t: "p", text: "**Why does wind blow?** Hot air rises and leaves **low pressure**; cool air sinks and creates **high pressure**. Air always moves from **high pressure to low pressure** — that moving air is wind. Because the Earth spins, winds bend: to the **right in the Northern Hemisphere** and to the left in the Southern (**Coriolis force**)." },
        {
          t: "table",
          head: ["Wind type", "Examples"],
          rows: [
            ["Permanent (planetary)", "Trade winds (blow towards the equator), Westerlies, Polar easterlies"],
            ["Seasonal", "Monsoons — change direction with the season"],
            ["Local", "Loo (hot, dry — north India), Chinook (“snow eater” — Rockies), Foehn (Alps), Sirocco (Sahara → Italy), Harmattan (“the doctor” — West Africa), Mistral (France)"],
          ],
        },
        { t: "p", text: "**Cyclones** are huge, spinning low-pressure storms. Same storm, different local names: **cyclone** (Indian Ocean), **hurricane** (Atlantic / East Pacific), **typhoon** (West Pacific, China Sea), **willy-willy** (Australia). Winds spin **anticlockwise** in the Northern Hemisphere. The calm centre is the **eye**." },
        { t: "p", text: "**Oceans.** About **71%** of the Earth's surface is water. **Pacific** is the largest and deepest ocean; its **Mariana Trench (Challenger Deep, about 11 km)** is the deepest point on Earth. **Ocean currents** are like rivers in the sea: **warm** currents flow from the equator towards the poles (e.g. **Gulf Stream**), **cold** currents flow towards the equator (e.g. **Labrador**, **Humboldt/Peru**). Where warm and cold currents meet (e.g. near **Newfoundland — Grand Banks**), fish are plentiful. **Tides** are caused mainly by the **Moon's** gravity; the highest tides (**spring tides**) come on full moon and new moon days." },
        { t: "trap", text: "The ozone layer is in the STRATOSPHERE, not the troposphere. Weather happens in the troposphere." },
        {
          t: "recap",
          items: [
            "N₂ 78%, O₂ 21%, Ar 0.93%, CO₂ ≈ 0.04%",
            "Troposphere = weather; stratosphere = ozone; mesosphere = meteors; ionosphere = radio waves",
            "Wind: high → low pressure; Coriolis bends right in the north",
            "Cyclone / hurricane / typhoon / willy-willy — anticlockwise in the north",
            "Pacific largest & deepest; Mariana Trench; warm Gulf Stream; tides due to the Moon",
          ],
        },
      ],
      quiz: [
        { q: "The ozone layer is found in the:", options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"], answer: 1, explain: "It absorbs harmful ultraviolet rays." },
        { q: "A tropical cyclone in the West Pacific is called a:", options: ["Hurricane", "Typhoon", "Willy-willy", "Tornado"], answer: 1, explain: "Typhoon — e.g. near the Philippines and China." },
        { q: "Radio waves are reflected back to Earth by the:", options: ["Troposphere", "Stratosphere", "Ionosphere", "Exosphere"], answer: 2, explain: "Ionosphere, part of the thermosphere." },
      ],
    },
  ],
};
