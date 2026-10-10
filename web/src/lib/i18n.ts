// Farmer calculator copy. Kinyarwanda is a first draft: the Rwandan team member reviews it before submission.

export const LANGS = ["rw", "en"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

const en = {
  langName: "English",
  title: "What will irrigation earn me?",
  intro: "Pick your district, your crop and your plot size. We compare irrigated and rain-fed plots of the same crop in the national farm survey.",
  district: "District",
  districtHelp: "Where your plot is.",
  crop: "Crop",
  cropHelp: "What you will grow on the irrigated plot.",
  area: "Plot size (m²)",
  areaHelp: "Square metres. 10 m × 10 m = 100 m².",
  areaError: "Enter a size between 1 and 100,000 m²",
  kit: "Irrigation kit",
  kitHelp: "Kit price before the government subsidy.",
  kits: { treadle: "Treadle pump", petrol: "Petrol pump and pipes", own: "My own quote" },
  kitPrice: "Kit price (RWF)",
  kitPriceHelp: "The price a supplier quoted you.",
  kitPriceError: "Enter the kit price in RWF",
  subsidy: "Government subsidy",
  subsidyHelp: "Solar kits get a bigger share paid.",
  subsidyRegular: "Regular 50%",
  subsidySolar: "Solar 75%",
  submit: "Calculate",
  emptyTitle: "Your estimate appears here",
  emptyBody: "Fill in your plot and press Calculate.",
  extraHarvest: "Extra harvest per season",
  extraMoney: "Extra money per season",
  youPay: "You pay for the kit",
  repay: "Pays for itself in",
  seasons: "seasons",
  never: "Does not pay back",
  rainfed: "Rain-fed harvest now",
  waterBonus: "Water bonus for this crop",
  lossNote: "In the survey, irrigated bean plots harvest less than rain-fed ones. Use the water for maize, vegetables or sweet potato instead.",
  zeroNote: "The survey shows no clear gain from irrigating this crop.",
  basis: "Based on NISR Seasonal Agricultural Survey 2020–2025 and median farm-gate prices. Seasons A and B only.",
  error: "Couldn't calculate. Check your connection.",
  crops: {} as Record<string, string>,
};

const rw: typeof en = {
  langName: "Kinyarwanda",
  title: "Kuhira bizanyungura iki?",
  intro: "Hitamo akarere, igihingwa n'ubuso bw'umurima wawe. Tugereranya imirima yuhirwa n'ituhirwa y'igihingwa kimwe mu ibarura ry'ubuhinzi.",
  district: "Akarere",
  districtHelp: "Aho umurima wawe uri.",
  crop: "Igihingwa",
  cropHelp: "Icyo uzahinga mu murima wuhirwa.",
  area: "Ubuso bw'umurima (m²)",
  areaHelp: "Metero kare. m 10 × m 10 = m² 100.",
  areaError: "Andika ubuso buri hagati ya 1 na 100,000 m²",
  kit: "Ibikoresho byo kuhira",
  kitHelp: "Igiciro cy'ibikoresho mbere ya nkunganire ya Leta.",
  kits: { treadle: "Pompe ikoreshwa n'amaguru", petrol: "Pompe ya lisansi n'amatiyo", own: "Igiciro nahawe" },
  kitPrice: "Igiciro cy'ibikoresho (RWF)",
  kitPriceHelp: "Igiciro umucuruzi yaguhaye.",
  kitPriceError: "Andika igiciro mu mafaranga",
  subsidy: "Nkunganire ya Leta",
  subsidyHelp: "Ibikoresho bikoresha imirasire y'izuba bihabwa nkunganire nini.",
  subsidyRegular: "Isanzwe 50%",
  subsidySolar: "Imirasire y'izuba 75%",
  submit: "Bara",
  emptyTitle: "Igisubizo kiza hano",
  emptyBody: "Uzuza amakuru y'umurima hanyuma ukande Bara.",
  extraHarvest: "Umusaruro wiyongera buri gihembwe",
  extraMoney: "Amafaranga yiyongera buri gihembwe",
  youPay: "Uzishyura ibikoresho",
  repay: "Igihe bizishyurirwa",
  seasons: "ibihembwe",
  never: "Ntibizagaruka",
  rainfed: "Umusaruro w'ubu utuhiye",
  waterBonus: "Inyongera y'amazi kuri iki gihingwa",
  lossNote: "Mu ibarura, imirima y'ibishyimbo yuhirwa yeza make kurusha ituhirwa. Ayo mazi yakoreshwa ku bigori, imboga cyangwa ibijumba.",
  zeroNote: "Ibarura ntirigaragaza inyungu igaragara yo kuhira iki gihingwa.",
  basis: "Bishingiye ku ibarura ry'ubuhinzi rya NISR 2020–2025 n'ibiciro byo ku isoko. Ibihembwe A na B gusa.",
  error: "Ntibyakunze. Reba interineti yawe.",
  crops: {
    Maize: "Ibigori",
    Beans: "Ibishyimbo",
    "Irish potato": "Ibirayi",
    "Sweet potato": "Ibijumba",
    Vegetables: "Imboga",
    Sorghum: "Amasaka",
    Cassava: "Imyumbati",
    "Paddy rice": "Umuceri",
    Soybean: "Soya",
    Wheat: "Ingano",
  },
};

export const copy: Record<Lang, typeof en> = { en, rw };

export function cropName(lang: Lang, crop: string): string {
  return copy[lang].crops[crop] ?? crop;
}
