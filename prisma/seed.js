import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const processBlueprints = [
  {
    name: "Corte",
    order: 1,
    category: "CORTE",
    machineryRefs: ["GUI-01"],
    fields: [],
  },
  {
    name: "Impresión",
    order: 2,
    category: "IMPRESION",
    machineryRefs: ["HEI-74", "DIG-01"],
    fields: [
      {
        key: "numero_tintas",
        label: "No. de tintas",
        field_type: "NUMBER",
        is_required: true,
      },
      {
        key: "descripcion_colores",
        label: "Descripción Colores",
        field_type: "TEXT",
        is_required: true,
      },
      {
        key: "policromia",
        label: "Policromia",
        field_type: "BOOLEAN",
        is_required: false,
      },
      {
        key: "retiro",
        label: "Retiro",
        field_type: "BOOLEAN",
        is_required: false,
      },
    ],
  },
  {
    name: "Plastificado",
    order: 3,
    category: "ACABADO",
    machineryRefs: ["PLA-01"],
    fields: [
      {
        key: "tipo_plastico",
        label: "Tipo plastico",
        field_type: "TEXT",
        is_required: true,
      },
      {
        key: "medida_plastico",
        label: "Medida",
        field_type: "TEXT",
        is_required: false,
      },
    ],
  },
  {
    name: "Troquelado",
    order: 4,
    category: "TROQUELADO",
    machineryRefs: ["TRQ-01"],
    fields: [],
  },
  {
    name: "Acabados Estampado",
    order: 5,
    category: "ACABADO",
    machineryRefs: [],
    fields: [
      {
        key: "color_estampado",
        label: "Color",
        field_type: "TEXT",
        is_required: true,
      },
    ],
  },
  {
    name: "Acabado de Pegado",
    order: 6,
    category: "PEGADO",
    machineryRefs: ["PEG-01"],
    fields: [
      {
        key: "tipo_pegue",
        label: "Tipo de pegue",
        field_type: "TEXT",
        is_required: false,
      },
    ],
  },
];

const userSeeds = [
  {
    name: "Admin",
    surename: "Principal",
    email: "admin@prograficos.com",
    password: "admin123",
    role: "ADMIN",
  },
  {
    name: "Carlos",
    surename: "Supervisor",
    email: "supervisor@prograficos.com",
    password: "super123",
    role: "SUPERVISOR",
  },
  {
    name: "Luis",
    surename: "Operario",
    email: "operario@prograficos.com",
    password: "operario123",
    role: "EMPLOYEE",
  },
];

const machinerySeeds = [
  {
    name: "Guillotina Polar",
    reference: "GUI-01",
    type: "GUILLOTINA",
  },
  {
    name: "Heidelberg 74",
    reference: "HEI-74",
    type: "IMPRESORA_OFFSET",
  },
  {
    name: "Konica Minolta C4080",
    reference: "DIG-01",
    type: "IMPRESORA_DIGITAL",
  },
  {
    name: "Plastificadora Termica",
    reference: "PLA-01",
    type: "PLASTIFICADORA",
  },
  {
    name: "Troqueladora Automatica",
    reference: "TRQ-01",
    type: "TROQUELADORA",
  },
  {
    name: "Pegadora Lineal",
    reference: "PEG-01",
    type: "PEGADORA",
  },
];

const troquelSeeds = [
  {
    code: "6",
    size: "MEDIUM",
    file_name: "m6.pdf",
    file: "troqueles/m6.pdf",
  },
  {
    code: "16",
    size: "MEDIUM",
    file_name: "m16.pdf",
    file: "troqueles/m16.pdf",
  },
  {
    code: "5",
    size: "MEDIUM",
    file_name: "m5.pdf",
    file: "troqueles/m5.pdf",
  },
  {
    code: "43",
    size: "MEDIUM",
    file_name: "m43.pdf",
    file: "troqueles/m43.pdf",
  },
  {
    code: "20",
    size: "MEDIUM",
    file_name: "m20.pdf",
    file: "troqueles/m20.pdf",
  },
  {
    code: "23",
    size: "LARGE",
    file_name: "l23.pdf",
    file: "troqueles/l23.pdf",
  },
  {
    code: "16",
    size: "LARGE",
    file_name: "l16.pdf",
    file: "troqueles/l16.pdf",
  },
  {
    code: "38",
    size: "MEDIUM",
    file_name: "m38.pdf",
    file: "troqueles/m38.pdf",
  },
  {
    code: "2",
    size: "SMALL",
    file_name: "s2.pdf",
    file: "troqueles/s2.pdf",
  },
  {
    code: "8",
    size: "MEDIUM",
    file_name: "m8.pdf",
    file: "troqueles/m8.pdf",
  },
  {
    code: "27",
    size: "SMALL",
    file_name: "s27.pdf",
    file: "troqueles/s27.pdf",
  },
  {
    code: "17",
    size: "SMALL",
    file_name: "s17.pdf",
    file: "troqueles/s17.pdf",
  },
  {
    code: "14",
    size: "SMALL",
    file_name: "s14.pdf",
    file: "troqueles/s14.pdf",
  },
  {
    code: "23",
    size: "MEDIUM",
    file_name: "m23.pdf",
    file: "troqueles/m23.pdf",
  },
  {
    code: "85",
    size: "SMALL",
    file_name: "s85.pdf",
    file: "troqueles/s85.pdf",
  },
  {
    code: "6",
    size: "SMALL",
    file_name: "s6.pdf",
    file: "troqueles/s6.pdf",
  },
  {
    code: "72",
    size: "MEDIUM",
    file_name: "m72.pdf",
    file: "troqueles/m72.pdf",
  },
  {
    code: "14",
    size: "MEDIUM",
    file_name: "m14.pdf",
    file: "troqueles/m14.pdf",
  },
  {
    code: "50",
    size: "MEDIUM",
    file_name: "m50.pdf",
    file: "troqueles/m50.pdf",
  },
  {
    code: "12",
    size: "MEDIUM",
    file_name: "m12.pdf",
    file: "troqueles/m12.pdf",
  },
  {
    code: "103",
    size: "SMALL",
    file_name: "s103.pdf",
    file: "troqueles/s103.pdf",
  },
  {
    code: "8",
    size: "SMALL",
    file_name: "s8.pdf",
    file: "troqueles/s8.pdf",
  },
  {
    code: "2",
    size: "LARGE",
    file_name: "l2.pdf",
    file: "troqueles/l2.pdf",
  },
  {
    code: "21",
    size: "MEDIUM",
    file_name: "m21.pdf",
    file: "troqueles/m21.pdf",
  },
  {
    code: "49",
    size: "MEDIUM",
    file_name: "m49.pdf",
    file: "troqueles/m49.pdf",
  },
  {
    code: "41",
    size: "MEDIUM",
    file_name: "m41.pdf",
    file: "troqueles/m41.pdf",
  },
  {
    code: "45",
    size: "MEDIUM",
    file_name: "m45.pdf",
    file: "troqueles/m45.pdf",
  },
  {
    code: "30",
    size: "LARGE",
    file_name: "l30.pdf",
    file: "troqueles/l30.pdf",
  },
  {
    code: "33",
    size: "MEDIUM",
    file_name: "m33.pdf",
    file: "troqueles/m33.pdf",
  },
  {
    code: "37",
    size: "MEDIUM",
    file_name: "m37.pdf",
    file: "troqueles/m37.pdf",
  },
  {
    code: "21",
    size: "SMALL",
    file_name: "s21.pdf",
    file: "troqueles/s21.pdf",
  },
  {
    code: "160",
    size: "SMALL",
    file_name: "s160.pdf",
    file: "troqueles/s160.pdf",
  },
  {
    code: "77",
    size: "MEDIUM",
    file_name: "m77.pdf",
    file: "troqueles/m77.pdf",
  },
  {
    code: "34",
    size: "LARGE",
    file_name: "l34.pdf",
    file: "troqueles/l34.pdf",
  },
  {
    code: "1",
    size: "LARGE",
    file_name: "l1.pdf",
    file: "troqueles/l1.pdf",
  },
  {
    code: "35",
    size: "LARGE",
    file_name: "l35.pdf",
    file: "troqueles/l35.pdf",
  },
  {
    code: "46",
    size: "MEDIUM",
    file_name: "m46.pdf",
    file: "troqueles/m46.pdf",
  },
  {
    code: "146",
    size: "SMALL",
    file_name: "s146.pdf",
    file: "troqueles/s146.pdf",
  },
  {
    code: "157",
    size: "SMALL",
    file_name: "s157.pdf",
    file: "troqueles/s157.pdf",
  },
  {
    code: "31",
    size: "MEDIUM",
    file_name: "m31.pdf",
    file: "troqueles/m31.pdf",
  },
  {
    code: "10",
    size: "MEDIUM",
    file_name: "m10.pdf",
    file: "troqueles/m10.pdf",
  },
  {
    code: "44",
    size: "MEDIUM",
    file_name: "m44.pdf",
    file: "troqueles/m44.pdf",
  },
  {
    code: "10",
    size: "LARGE",
    file_name: "l10.pdf",
    file: "troqueles/l10.pdf",
  },
  {
    code: "22",
    size: "LARGE",
    file_name: "l22.pdf",
    file: "troqueles/l22.pdf",
  },
  {
    code: "27",
    size: "LARGE",
    file_name: "l27.pdf",
    file: "troqueles/l27.pdf",
  },
  {
    code: "28",
    size: "LARGE",
    file_name: "l28.pdf",
    file: "troqueles/l28.pdf",
  },
  {
    code: "101",
    size: "SMALL",
    file_name: "s101.pdf",
    file: "troqueles/s101.pdf",
  },
  {
    code: "100",
    size: "SMALL",
    file_name: "s100.pdf",
    file: "troqueles/s100.pdf",
  },
  {
    code: "56",
    size: "MEDIUM",
    file_name: "m56.pdf",
    file: "troqueles/m56.pdf",
  },
  {
    code: "57",
    size: "MEDIUM",
    file_name: "m57.pdf",
    file: "troqueles/m57.pdf",
  },
  {
    code: "92",
    size: "SMALL",
    file_name: "s92.pdf",
    file: "troqueles/s92.pdf",
  },
  {
    code: "54",
    size: "MEDIUM",
    file_name: "m54.pdf",
    file: "troqueles/m54.pdf",
  },
  {
    code: "95",
    size: "SMALL",
    file_name: "s95.pdf",
    file: "troqueles/s95.pdf",
  },
  {
    code: "58",
    size: "SMALL",
    file_name: "s58.pdf",
    file: "troqueles/s58.pdf",
  },
  {
    code: "47",
    size: "MEDIUM",
    file_name: "m47.pdf",
    file: "troqueles/m47.pdf",
  },
  {
    code: "11",
    size: "MEDIUM",
    file_name: "m11.pdf",
    file: "troqueles/m11.pdf",
  },
  {
    code: "52",
    size: "MEDIUM",
    file_name: "m52.pdf",
    file: "troqueles/m52.pdf",
  },
  {
    code: "53",
    size: "MEDIUM",
    file_name: "m53.pdf",
    file: "troqueles/m53.pdf",
  },
  {
    code: "29",
    size: "LARGE",
    file_name: "l29.pdf",
    file: "troqueles/l29.pdf",
  },
  {
    code: "70",
    size: "SMALL",
    file_name: "s70.pdf",
    file: "troqueles/s70.pdf",
  },
  {
    code: "127",
    size: "SMALL",
    file_name: "s127.pdf",
    file: "troqueles/s127.pdf",
  },
  {
    code: "131",
    size: "SMALL",
    file_name: "s131.pdf",
    file: "troqueles/s131.pdf",
  },
  {
    code: "55",
    size: "SMALL",
    file_name: "s55.pdf",
    file: "troqueles/s55.pdf",
  },
  {
    code: "154",
    size: "SMALL",
    file_name: "s154.pdf",
    file: "troqueles/s154.pdf",
  },
  {
    code: "55",
    size: "MEDIUM",
    file_name: "m55.pdf",
    file: "troqueles/m55.pdf",
  },
  {
    code: "32",
    size: "MEDIUM",
    file_name: "m32.pdf",
    file: "troqueles/m32.pdf",
  },
  {
    code: "136",
    size: "SMALL",
    file_name: "s136.pdf",
    file: "troqueles/s136.pdf",
  },
  {
    code: "108",
    size: "SMALL",
    file_name: "s108.pdf",
    file: "troqueles/s108.pdf",
  },
  {
    code: "94",
    size: "SMALL",
    file_name: "s94.pdf",
    file: "troqueles/s94.pdf",
  },
  {
    code: "107",
    size: "SMALL",
    file_name: "s107.pdf",
    file: "troqueles/s107.pdf",
  },
  {
    code: "111",
    size: "SMALL",
    file_name: "s111.pdf",
    file: "troqueles/s111.pdf",
  },
  {
    code: "130",
    size: "SMALL",
    file_name: "s130.pdf",
    file: "troqueles/s130.pdf",
  },
  {
    code: "113",
    size: "SMALL",
    file_name: "s113.pdf",
    file: "troqueles/s113.pdf",
  },
  {
    code: "42",
    size: "SMALL",
    file_name: "s42.pdf",
    file: "troqueles/s42.pdf",
  },
  {
    code: "120",
    size: "SMALL",
    file_name: "s120.pdf",
    file: "troqueles/s120.pdf",
  },
  {
    code: "121",
    size: "SMALL",
    file_name: "s121.pdf",
    file: "troqueles/s121.pdf",
  },
  {
    code: "76",
    size: "MEDIUM",
    file_name: "m76.pdf",
    file: "troqueles/m76.pdf",
  },
  {
    code: "25",
    size: "SMALL",
    file_name: "s25.pdf",
    file: "troqueles/s25.pdf",
  },
  {
    code: "10",
    size: "SMALL",
    file_name: "s10.pdf",
    file: "troqueles/s10.pdf",
  },
  {
    code: "28",
    size: "SMALL",
    file_name: "s28.pdf",
    file: "troqueles/s28.pdf",
  },
  {
    code: "17",
    size: "MEDIUM",
    file_name: "m17.pdf",
    file: "troqueles/m17.pdf",
  },
  {
    code: "20",
    size: "SMALL",
    file_name: "s20.pdf",
    file: "troqueles/s20.pdf",
  },
  {
    code: "29",
    size: "MEDIUM",
    file_name: "m29.pdf",
    file: "troqueles/m29.pdf",
  },
  {
    code: "137",
    size: "SMALL",
    file_name: "s137.pdf",
    file: "troqueles/s137.pdf",
  },
  {
    code: "140",
    size: "SMALL",
    file_name: "s140.pdf",
    file: "troqueles/s140.pdf",
  },
  {
    code: "141",
    size: "SMALL",
    file_name: "s141.pdf",
    file: "troqueles/s141.pdf",
  },
  {
    code: "138",
    size: "SMALL",
    file_name: "s138.pdf",
    file: "troqueles/s138.pdf",
  },
  {
    code: "139",
    size: "SMALL",
    file_name: "s139.pdf",
    file: "troqueles/s139.pdf",
  },
  {
    code: "147",
    size: "SMALL",
    file_name: "s147.pdf",
    file: "troqueles/s147.pdf",
  },
  {
    code: "45",
    size: "SMALL",
    file_name: "s45.pdf",
    file: "troqueles/s45.pdf",
  },
  {
    code: "54",
    size: "SMALL",
    file_name: "s54.pdf",
    file: "troqueles/s54.pdf",
  },
  {
    code: "153",
    size: "SMALL",
    file_name: "s153.pdf",
    file: "troqueles/s153.pdf",
  },
  {
    code: "80",
    size: "MEDIUM",
    file_name: "m80.pdf",
    file: "troqueles/m80.pdf",
  },
  {
    code: "159",
    size: "SMALL",
    file_name: "s159.pdf",
    file: "troqueles/s159.pdf",
  },
  {
    code: "10 Y L22",
    size: "LARGE",
    file_name: "l10_y_l22.pdf",
    file: "troqueles/l10_y_l22.pdf",
  },
  {
    code: "27 Y L 28",
    size: "LARGE",
    file_name: "l27_y_l_28.pdf",
    file: "troqueles/l27_y_l_28.pdf",
  },
  {
    code: "107 CUN/ S111 FUN.",
    size: "SMALL",
    file_name: "s107_cun_s111_fun.pdf",
    file: "troqueles/s107_cun_s111_fun.pdf",
  },
  {
    code: "120 Y S121",
    size: "SMALL",
    file_name: "s120_y_s121.pdf",
    file: "troqueles/s120_y_s121.pdf",
  },
  {
    code: "45 / S54",
    size: "SMALL",
    file_name: "s45_s54.pdf",
    file: "troqueles/s45_s54.pdf",
  },
  {
    code: "SOLO IMPRESION Y CORTE",
    size: "SMALL",
    file_name: "solo_impresion_y_corte.pdf",
    file: "troqueles/solo_impresion_y_corte.pdf",
  },
];

const paperTypeSeeds = [
  {
    name: "Optimo Kraft",
    description: "Papel kraft para empaque",
    grammage: 200,
  },
  {
    name: "Propalcote",
    description: "Papel brillante para cajas plegadizas",
    grammage: 150,
  },
  {
    name: "Bond",
    description: "Papel estandar para material comercial",
    grammage: 90,
  },
];

const thirdSeeds = [
  {
    "name": "ALEXPECIAL",
    "email": "contacto.alexpecial@clientes.prograficos.local",
    "address": "Dirección pendiente · ALEXPECIAL",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000011",
    "company_name": "ALEXPECIAL"
  },
  {
    "name": "AMA DE LLAVES",
    "email": "contacto.ama-de-llaves@clientes.prograficos.local",
    "address": "Dirección pendiente · AMA DE LLAVES",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000040",
    "company_name": "AMA DE LLAVES"
  },
  {
    "name": "AMANITA",
    "email": "contacto.amanita@clientes.prograficos.local",
    "address": "Dirección pendiente · AMANITA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000023",
    "company_name": "AMANITA"
  },
  {
    "name": "ANGELICA HERNANDEZ",
    "email": "contacto.angelica-hernandez@clientes.prograficos.local",
    "address": "Dirección pendiente · ANGELICA HERNANDEZ",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000047",
    "company_name": "ANGELICA HERNANDEZ"
  },
  {
    "name": "AZKASÁN",
    "email": "contacto.azkasan@clientes.prograficos.local",
    "address": "Dirección pendiente · AZKASÁN",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000014",
    "company_name": "AZKASÁN"
  },
  {
    "name": "BENDITA PARRILLA",
    "email": "contacto.bendita-parrilla@clientes.prograficos.local",
    "address": "Dirección pendiente · BENDITA PARRILLA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000013",
    "company_name": "BENDITA PARRILLA"
  },
  {
    "name": "BRODERS WING",
    "email": "contacto.broders-wing@clientes.prograficos.local",
    "address": "Dirección pendiente · BRODERS WING",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000003",
    "company_name": "BRODERS WING"
  },
  {
    "name": "BUFALO",
    "email": "contacto.bufalo@clientes.prograficos.local",
    "address": "Dirección pendiente · BUFALO",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000046",
    "company_name": "BUFALO"
  },
  {
    "name": "BURGUER HOUSE",
    "email": "contacto.burguer-house@clientes.prograficos.local",
    "address": "Dirección pendiente · BURGUER HOUSE",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000035",
    "company_name": "BURGUER HOUSE"
  },
  {
    "name": "CAPITAN WINGS",
    "email": "contacto.capitan-wings@clientes.prograficos.local",
    "address": "Dirección pendiente · CAPITAN WINGS",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000025",
    "company_name": "CAPITAN WINGS"
  },
  {
    "name": "COMFAMILIAR",
    "email": "contacto.comfamiliar@clientes.prograficos.local",
    "address": "Dirección pendiente · COMFAMILIAR",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000022",
    "company_name": "COMFAMILIAR"
  },
  {
    "name": "CUCHIFLI",
    "email": "contacto.cuchifli@clientes.prograficos.local",
    "address": "Dirección pendiente · CUCHIFLI",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000031",
    "company_name": "CUCHIFLI"
  },
  {
    "name": "CUKIS XL",
    "email": "contacto.cukis-xl@clientes.prograficos.local",
    "address": "Dirección pendiente · CUKIS XL",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000018",
    "company_name": "CUKIS XL"
  },
  {
    "name": "DOGOS",
    "email": "contacto.dogos@clientes.prograficos.local",
    "address": "Dirección pendiente · DOGOS",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000036",
    "company_name": "DOGOS"
  },
  {
    "name": "EL SABOR DEL CHURRO",
    "email": "contacto.el-sabor-del-churro@clientes.prograficos.local",
    "address": "Dirección pendiente · EL SABOR DEL CHURRO",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000049",
    "company_name": "EL SABOR DEL CHURRO"
  },
  {
    "name": "EL TIESTO DEL TAITA",
    "email": "contacto.el-tiesto-del-taita@clientes.prograficos.local",
    "address": "Dirección pendiente · EL TIESTO DEL TAITA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000038",
    "company_name": "EL TIESTO DEL TAITA"
  },
  {
    "name": "FRAIA",
    "email": "contacto.fraia@clientes.prograficos.local",
    "address": "Dirección pendiente · FRAIA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000020",
    "company_name": "FRAIA"
  },
  {
    "name": "FRUPYS",
    "email": "contacto.frupys@clientes.prograficos.local",
    "address": "Dirección pendiente · FRUPYS",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000009",
    "company_name": "FRUPYS"
  },
  {
    "name": "GATO CON BOTAS",
    "email": "contacto.gato-con-botas@clientes.prograficos.local",
    "address": "Dirección pendiente · GATO CON BOTAS",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000005",
    "company_name": "GATO CON BOTAS"
  },
  {
    "name": "GRAZZIA",
    "email": "contacto.grazzia@clientes.prograficos.local",
    "address": "Dirección pendiente · GRAZZIA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000032",
    "company_name": "GRAZZIA"
  },
  {
    "name": "HACEB",
    "email": "contacto.haceb@clientes.prograficos.local",
    "address": "Dirección pendiente · HACEB",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000048",
    "company_name": "HACEB"
  },
  {
    "name": "HAMBURGO",
    "email": "contacto.hamburgo@clientes.prograficos.local",
    "address": "Dirección pendiente · HAMBURGO",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000007",
    "company_name": "HAMBURGO"
  },
  {
    "name": "HAMBURGO KIDS",
    "email": "contacto.hamburgo-kids@clientes.prograficos.local",
    "address": "Dirección pendiente · HAMBURGO KIDS",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000008",
    "company_name": "HAMBURGO KIDS"
  },
  {
    "name": "KAKAOWA",
    "email": "contacto.kakaowa@clientes.prograficos.local",
    "address": "Dirección pendiente · KAKAOWA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000028",
    "company_name": "KAKAOWA"
  },
  {
    "name": "KING BROASTED",
    "email": "contacto.king-broasted@clientes.prograficos.local",
    "address": "Dirección pendiente · KING BROASTED",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000001",
    "company_name": "KING BROASTED"
  },
  {
    "name": "LA BURGUESERIA",
    "email": "contacto.la-burgueseria@clientes.prograficos.local",
    "address": "Dirección pendiente · LA BURGUESERIA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000041",
    "company_name": "LA BURGUESERIA"
  },
  {
    "name": "LA CABAÑITA",
    "email": "contacto.la-cabanita@clientes.prograficos.local",
    "address": "Dirección pendiente · LA CABAÑITA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000043",
    "company_name": "LA CABAÑITA"
  },
  {
    "name": "LA GOGO",
    "email": "contacto.la-gogo@clientes.prograficos.local",
    "address": "Dirección pendiente · LA GOGO",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000015",
    "company_name": "LA GOGO"
  },
  {
    "name": "LA GRANJA B.",
    "email": "contacto.la-granja-b@clientes.prograficos.local",
    "address": "Dirección pendiente · LA GRANJA B.",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000004",
    "company_name": "LA GRANJA B."
  },
  {
    "name": "LA ROSTICERÍA",
    "email": "contacto.la-rosticeria@clientes.prograficos.local",
    "address": "Dirección pendiente · LA ROSTICERÍA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000010",
    "company_name": "LA ROSTICERÍA"
  },
  {
    "name": "LA TOSTANA.",
    "email": "contacto.la-tostana@clientes.prograficos.local",
    "address": "Dirección pendiente · LA TOSTANA.",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000006",
    "company_name": "LA TOSTANA."
  },
  {
    "name": "LAS PERRAS DEL POLAN",
    "email": "contacto.las-perras-del-polan@clientes.prograficos.local",
    "address": "Dirección pendiente · LAS PERRAS DEL POLAN",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000024",
    "company_name": "LAS PERRAS DEL POLAN"
  },
  {
    "name": "LELIS COOKIES",
    "email": "contacto.lelis-cookies@clientes.prograficos.local",
    "address": "Dirección pendiente · LELIS COOKIES",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000021",
    "company_name": "LELIS COOKIES"
  },
  {
    "name": "LEÑOS PARRILLA",
    "email": "contacto.lenos-parrilla@clientes.prograficos.local",
    "address": "Dirección pendiente · LEÑOS PARRILLA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000044",
    "company_name": "LEÑOS PARRILLA"
  },
  {
    "name": "MASABOR",
    "email": "contacto.masabor@clientes.prograficos.local",
    "address": "Dirección pendiente · MASABOR",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000002",
    "company_name": "MASABOR"
  },
  {
    "name": "MINOXIDIL",
    "email": "contacto.minoxidil@clientes.prograficos.local",
    "address": "Dirección pendiente · MINOXIDIL",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000050",
    "company_name": "MINOXIDIL"
  },
  {
    "name": "MR. SABOR BURGUERS",
    "email": "contacto.mr-sabor-burguers@clientes.prograficos.local",
    "address": "Dirección pendiente · MR. SABOR BURGUERS",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000042",
    "company_name": "MR. SABOR BURGUERS"
  },
  {
    "name": "MRS. CREPES",
    "email": "contacto.mrs-crepes@clientes.prograficos.local",
    "address": "Dirección pendiente · MRS. CREPES",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000016",
    "company_name": "MRS. CREPES"
  },
  {
    "name": "NEXT LEVEL BURGUER",
    "email": "contacto.next-level-burguer@clientes.prograficos.local",
    "address": "Dirección pendiente · NEXT LEVEL BURGUER",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000051",
    "company_name": "NEXT LEVEL BURGUER"
  },
  {
    "name": "PACHI",
    "email": "contacto.pachi@clientes.prograficos.local",
    "address": "Dirección pendiente · PACHI",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000019",
    "company_name": "PACHI"
  },
  {
    "name": "PAPOSAURIAS",
    "email": "contacto.paposaurias@clientes.prograficos.local",
    "address": "Dirección pendiente · PAPOSAURIAS",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000029",
    "company_name": "PAPOSAURIAS"
  },
  {
    "name": "POLLO PIO PIO",
    "email": "contacto.pollo-pio-pio@clientes.prograficos.local",
    "address": "Dirección pendiente · POLLO PIO PIO",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000030",
    "company_name": "POLLO PIO PIO"
  },
  {
    "name": "Q´ BARBARO",
    "email": "contacto.q-barbaro@clientes.prograficos.local",
    "address": "Dirección pendiente · Q´ BARBARO",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000045",
    "company_name": "Q´ BARBARO"
  },
  {
    "name": "ROYAL BURGUER",
    "email": "contacto.royal-burguer@clientes.prograficos.local",
    "address": "Dirección pendiente · ROYAL BURGUER",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000033",
    "company_name": "ROYAL BURGUER"
  },
  {
    "name": "SALCHIWINGS",
    "email": "contacto.salchiwings@clientes.prograficos.local",
    "address": "Dirección pendiente · SALCHIWINGS",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000039",
    "company_name": "SALCHIWINGS"
  },
  {
    "name": "SERENDIPIA",
    "email": "contacto.serendipia@clientes.prograficos.local",
    "address": "Dirección pendiente · SERENDIPIA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000017",
    "company_name": "SERENDIPIA"
  },
  {
    "name": "TATACOA",
    "email": "contacto.tatacoa@clientes.prograficos.local",
    "address": "Dirección pendiente · TATACOA",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000027",
    "company_name": "TATACOA"
  },
  {
    "name": "THE LOCOS BURGER",
    "email": "contacto.the-locos-burger@clientes.prograficos.local",
    "address": "Dirección pendiente · THE LOCOS BURGER",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000026",
    "company_name": "THE LOCOS BURGER"
  },
  {
    "name": "TNT - PITALITO",
    "email": "contacto.tnt-pitalito@clientes.prograficos.local",
    "address": "Dirección pendiente · TNT - PITALITO",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000037",
    "company_name": "TNT - PITALITO"
  },
  {
    "name": "TOLIMAX",
    "email": "contacto.tolimax@clientes.prograficos.local",
    "address": "Dirección pendiente · TOLIMAX",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000012",
    "company_name": "TOLIMAX"
  },
  {
    "name": "YOYO KIDS",
    "email": "contacto.yoyo-kids@clientes.prograficos.local",
    "address": "Dirección pendiente · YOYO KIDS",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000034",
    "company_name": "YOYO KIDS"
  },
  {
    "name": "ZORA SUSHI",
    "email": "contacto.zora-sushi@clientes.prograficos.local",
    "address": "Dirección pendiente · ZORA SUSHI",
    "type_person": "CLIENTE",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "930000052",
    "company_name": "ZORA SUSHI"
  },
  {
    "name": "Proveedor Papel",
    "email": "compras@proveedorpapel.com",
    "address": "Parque industrial",
    "type_person": "PROVEEDOR",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "901234567",
    "company_name": "Proveedor Papel SAS"
  },
  {
    "name": "Dispapeles",
    "email": "ventas@dispapeles.com",
    "address": "Zona logistica",
    "type_person": "PROVEEDOR",
    "person_type": "JURIDICA",
    "document_type": "NIT",
    "document_number": "902345678",
    "company_name": "Dispapeles SAS"
  }
];

const productSeeds = [
  {
    "name": "CAJA COMPLEMENTO",
    "troquelCode": "6",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local"
  },
  {
    "name": "CAJA CUARTO",
    "troquelCode": "16",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local"
  },
  {
    "name": "CAJAS MEDIO",
    "troquelCode": "5",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local"
  },
  {
    "name": "CAJAS GRANDE P.",
    "troquelCode": "43",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA COMPLEMENTO",
    "troquelCode": "20",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA MEDIO",
    "troquelCode": "23",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA POLLO",
    "troquelCode": "16",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local"
  },
  {
    "name": "CAJA HAMBURGUESA",
    "troquelCode": "38",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local"
  },
  {
    "name": "CAJA SANDWICH",
    "troquelCode": "2",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local"
  },
  {
    "name": "CAJA COMPLEMENTO",
    "troquelCode": "6",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.masabor@clientes.prograficos.local"
  },
  {
    "name": "CAJA CUARTO",
    "troquelCode": "16",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.masabor@clientes.prograficos.local"
  },
  {
    "name": "CAJA MEDIO .",
    "troquelCode": "5",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.masabor@clientes.prograficos.local"
  },
  {
    "name": "CAJA GRANDE .",
    "troquelCode": "43",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.masabor@clientes.prograficos.local"
  },
  {
    "name": "CAJA ALITAS",
    "troquelCode": "8",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.masabor@clientes.prograficos.local"
  },
  {
    "name": "CAJAS ALITAS BBQ",
    "troquelCode": "8",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.broders-wing@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA CANOA",
    "troquelCode": "27",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local"
  },
  {
    "name": "PORTA PERROS MESA",
    "troquelCode": "17",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local"
  },
  {
    "name": "CAJA MAZORCADA/MOSTER",
    "troquelCode": "14",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local"
  },
  {
    "name": "CAJA COSTILLAS - PECHUGA",
    "troquelCode": "23",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local"
  },
  {
    "name": "PORTA PAPAS",
    "troquelCode": "85",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA DOBLE SALCHIPAPA",
    "troquelCode": "6",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local"
  },
  {
    "name": "CAJA GALLETA * 4 / ICE CREAM",
    "troquelCode": "72",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local"
  },
  {
    "name": "CAJA DE BOX",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local"
  },
  {
    "name": "CAJA KIDS",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local"
  },
  {
    "name": "CAJA DOMICILIO",
    "troquelCode": "50",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.gato-con-botas@clientes.prograficos.local"
  },
  {
    "name": "CAJA DOMICILIO",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-tostana@clientes.prograficos.local"
  },
  {
    "name": "CAJA DOMICILIO",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.hamburgo@clientes.prograficos.local"
  },
  {
    "name": "CAJA KIDS",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.hamburgo-kids@clientes.prograficos.local"
  },
  {
    "name": "Caja Complemento",
    "troquelCode": "12",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.frupys@clientes.prograficos.local"
  },
  {
    "name": "Caja Mediana",
    "troquelCode": "103",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.frupys@clientes.prograficos.local"
  },
  {
    "name": "Caja Grande",
    "troquelCode": "50",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.frupys@clientes.prograficos.local"
  },
  {
    "name": "CONO TENTACION / METALIZADO",
    "troquelCode": "8",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.frupys@clientes.prograficos.local"
  },
  {
    "name": "Caja Waffle",
    "troquelCode": "2",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.frupys@clientes.prograficos.local"
  },
  {
    "name": "Caja Domicilio",
    "troquelCode": "50",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.frupys@clientes.prograficos.local"
  },
  {
    "name": "EMPAQUE CONO",
    "troquelCode": "21",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-rosticeria@clientes.prograficos.local"
  },
  {
    "name": "CAJA MEDIO POLLO",
    "troquelCode": "49",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-rosticeria@clientes.prograficos.local"
  },
  {
    "name": "CAJA POLLO GRANDE",
    "troquelCode": "41",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-rosticeria@clientes.prograficos.local"
  },
  {
    "name": "CAJA BROCHETA",
    "troquelCode": "45",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-rosticeria@clientes.prograficos.local"
  },
  {
    "name": "CAJA PORTAPERROS",
    "troquelCode": "30",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.la-rosticeria@clientes.prograficos.local"
  },
  {
    "name": "CAJA BRAZOS DE REINA",
    "troquelCode": "33",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.alexpecial@clientes.prograficos.local"
  },
  {
    "name": "CAJA DISPLAY PASTILLAS",
    "troquelCode": "37",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.tolimax@clientes.prograficos.local"
  },
  {
    "name": "CAJA DOMICILIO",
    "troquelCode": "50",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.bendita-parrilla@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA",
    "troquelCode": "21",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.bendita-parrilla@clientes.prograficos.local"
  },
  {
    "name": "CAJA HAMBURGUESA SENCILLA.",
    "troquelCode": "38",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.azkasan@clientes.prograficos.local"
  },
  {
    "name": "CAJA COMBO",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.azkasan@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA BURGUER MASTER",
    "troquelCode": "160",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.azkasan@clientes.prograficos.local"
  },
  {
    "name": "CAJA KIDS BARCO",
    "troquelCode": "77",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.azkasan@clientes.prograficos.local"
  },
  {
    "name": "CAJA DESAYUNO",
    "troquelCode": "49",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-gogo@clientes.prograficos.local"
  },
  {
    "name": "CAJA DOMICILIO GRAN- DES. SORPR 04",
    "troquelCode": "34",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.la-gogo@clientes.prograficos.local"
  },
  {
    "name": "CAJA DOMICILIO MEDIA.",
    "troquelCode": "1",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.la-gogo@clientes.prograficos.local"
  },
  {
    "name": "CAJA TORTA RED VELVET.",
    "troquelCode": "35",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.la-gogo@clientes.prograficos.local"
  },
  {
    "name": "CAJA TRUFAS / BASE TAPA.",
    "troquelCode": "46",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-gogo@clientes.prograficos.local"
  },
  {
    "name": "PORTATORTAS.",
    "troquelCode": "146",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.la-gogo@clientes.prograficos.local"
  },
  {
    "name": "CAJA COMBO",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-gogo@clientes.prograficos.local"
  },
  {
    "name": "CAJA CUPCAKES",
    "troquelCode": "157",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.la-gogo@clientes.prograficos.local"
  },
  {
    "name": "CONO",
    "troquelCode": "31",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.mrs-crepes@clientes.prograficos.local"
  },
  {
    "name": "CAJA PORC. TORTA TRIANGULAR PEQ",
    "troquelCode": "10",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.serendipia@clientes.prograficos.local"
  },
  {
    "name": "CAJA TORTA PEQUEÑA 14*14",
    "troquelCode": "44",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.serendipia@clientes.prograficos.local"
  },
  {
    "name": "CAJA TORTA MEDIANA 22*22*17",
    "troquelCode": "10 Y L22",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.serendipia@clientes.prograficos.local"
  },
  {
    "name": "TORTA LIBRA 30*30",
    "troquelCode": "27 Y L 28",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.serendipia@clientes.prograficos.local"
  },
  {
    "name": "BLONDA *17 DIAM.",
    "troquelCode": "101",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.serendipia@clientes.prograficos.local"
  },
  {
    "name": "BLONDA *19 DIAM.",
    "troquelCode": "100",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.serendipia@clientes.prograficos.local"
  },
  {
    "name": "BLONDA *29 DIAM",
    "troquelCode": "56",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.serendipia@clientes.prograficos.local"
  },
  {
    "name": "BLONDA *30 DIAM.",
    "troquelCode": "57",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.serendipia@clientes.prograficos.local"
  },
  {
    "name": "CAJA GALLETA *4",
    "troquelCode": "92",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.cukis-xl@clientes.prograficos.local"
  },
  {
    "name": "CAJA GALLETA *2",
    "troquelCode": "54",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.cukis-xl@clientes.prograficos.local"
  },
  {
    "name": "CAJA CHOCOLATE",
    "troquelCode": "95",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.pachi@clientes.prograficos.local"
  },
  {
    "name": "CHOCOLATE PITALEÑO.",
    "troquelCode": "58",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.pachi@clientes.prograficos.local"
  },
  {
    "name": "TAPA YUMBO - LICOR",
    "troquelCode": "47",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.fraia@clientes.prograficos.local"
  },
  {
    "name": "CAJA PEQUEÑA - BASE",
    "troquelCode": "11",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.fraia@clientes.prograficos.local"
  },
  {
    "name": "CAJA G*4",
    "troquelCode": "52",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.lelis-cookies@clientes.prograficos.local"
  },
  {
    "name": "CAJA G*2",
    "troquelCode": "53",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.lelis-cookies@clientes.prograficos.local"
  },
  {
    "name": "CAJA LONCHERA",
    "troquelCode": "29",
    "troquelSize": "LARGE",
    "thirdEmail": "contacto.comfamiliar@clientes.prograficos.local"
  },
  {
    "name": "CAJA SHAMPOO",
    "troquelCode": "70",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.amanita@clientes.prograficos.local"
  },
  {
    "name": "CAJA LABIALES OPALITO",
    "troquelCode": "127",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.amanita@clientes.prograficos.local"
  },
  {
    "name": "CAJA LABIAL RED VELVET",
    "troquelCode": "127",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.amanita@clientes.prograficos.local"
  },
  {
    "name": "CAJA LABIAL ROSA POP",
    "troquelCode": "127",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.amanita@clientes.prograficos.local"
  },
  {
    "name": "CAJA ALMENDRINA",
    "troquelCode": "131",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.amanita@clientes.prograficos.local"
  },
  {
    "name": "CAJA JABON CURCUMA",
    "troquelCode": "55",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.amanita@clientes.prograficos.local"
  },
  {
    "name": "BOLSA ESTAMPADA / DO CARE.",
    "troquelCode": "154",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.amanita@clientes.prograficos.local"
  },
  {
    "name": "CAJA PORTAPERROS",
    "troquelCode": "55",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.las-perras-del-polan@clientes.prograficos.local"
  },
  {
    "name": "ALITAS WINGS",
    "troquelCode": "50",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.capitan-wings@clientes.prograficos.local"
  },
  {
    "name": "CAJA HAMBURGUESA DINA",
    "troquelCode": "32",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.capitan-wings@clientes.prograficos.local"
  },
  {
    "name": "CAJA HAMBURGUESA",
    "troquelCode": "38",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.the-locos-burger@clientes.prograficos.local"
  },
  {
    "name": "CAJA HAMBURGUESA",
    "troquelCode": "38",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.tatacoa@clientes.prograficos.local"
  },
  {
    "name": "CAJA COMBO",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.tatacoa@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA HEXAGONAL.",
    "troquelCode": "136",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.tatacoa@clientes.prograficos.local"
  },
  {
    "name": "CAJA CHOCOLATE",
    "troquelCode": "108",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.kakaowa@clientes.prograficos.local"
  },
  {
    "name": "CAJA ELIXIR DE LA VIDA -ESTUCHE",
    "troquelCode": "94",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.kakaowa@clientes.prograficos.local"
  },
  {
    "name": "CAJA CHOCOLATE * 5 / BASE TAPA",
    "troquelCode": "107 CUN/ S111 FUN.",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.kakaowa@clientes.prograficos.local"
  },
  {
    "name": "PEGABLE",
    "troquelCode": "130",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.kakaowa@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA HEXAGONAL PERSONAL",
    "troquelCode": "113",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.paposaurias@clientes.prograficos.local"
  },
  {
    "name": "CAJA POLLO GRANDE",
    "troquelCode": "50",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.pollo-pio-pio@clientes.prograficos.local"
  },
  {
    "name": "CAJA POLLO MEDIO",
    "troquelCode": "49",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.pollo-pio-pio@clientes.prograficos.local"
  },
  {
    "name": "CAJA PEQUEÑA",
    "troquelCode": "42",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.cuchifli@clientes.prograficos.local"
  },
  {
    "name": "CAJA PORCION PIZZA - BASE / TAPA",
    "troquelCode": "120 Y S121",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.grazzia@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA PIZZA MASTER/ HEXAGONAL",
    "troquelCode": "76",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.grazzia@clientes.prograficos.local"
  },
  {
    "name": "CAJA HAMBURGUESA",
    "troquelCode": "38",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.royal-burguer@clientes.prograficos.local"
  },
  {
    "name": "CAJA COMBO",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.royal-burguer@clientes.prograficos.local"
  },
  {
    "name": "CAJA MAZORCADA CON TAPA",
    "troquelCode": "25",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.royal-burguer@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA DOBLE SIN TAPA",
    "troquelCode": "6",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.royal-burguer@clientes.prograficos.local"
  },
  {
    "name": "CAJA HOT DOG-CON TAPA",
    "troquelCode": "2",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.royal-burguer@clientes.prograficos.local"
  },
  {
    "name": "CAJA PORTAPERROS.",
    "troquelCode": "17",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.royal-burguer@clientes.prograficos.local"
  },
  {
    "name": "CAJA COSTILLAS",
    "troquelCode": "23",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.royal-burguer@clientes.prograficos.local"
  },
  {
    "name": "CONO",
    "troquelCode": "10",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.yoyo-kids@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA",
    "troquelCode": "28",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.yoyo-kids@clientes.prograficos.local"
  },
  {
    "name": "CAJA HAMBURGUESA",
    "troquelCode": "38",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.burguer-house@clientes.prograficos.local"
  },
  {
    "name": "PORTA PERROS",
    "troquelCode": "2",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.dogos@clientes.prograficos.local"
  },
  {
    "name": "CAJA KIDS",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.dogos@clientes.prograficos.local"
  },
  {
    "name": "CAJA HAMBURGUESA",
    "troquelCode": "38",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.tnt-pitalito@clientes.prograficos.local"
  },
  {
    "name": "CAJA MEDIO",
    "troquelCode": "49",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.el-tiesto-del-taita@clientes.prograficos.local"
  },
  {
    "name": "CAJA GRANDE",
    "troquelCode": "17",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.el-tiesto-del-taita@clientes.prograficos.local"
  },
  {
    "name": "CAJA BANDEJA -DOBLE",
    "troquelCode": "6",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.salchiwings@clientes.prograficos.local"
  },
  {
    "name": "CAJA MAZORCADA",
    "troquelCode": "14",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.salchiwings@clientes.prograficos.local"
  },
  {
    "name": "CAJA COSTILLA.",
    "troquelCode": "23",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.salchiwings@clientes.prograficos.local"
  },
  {
    "name": "CLEAN READY / CAJA PASTILLA",
    "troquelCode": "20",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.ama-de-llaves@clientes.prograficos.local"
  },
  {
    "name": "CAJA HAMBURGUESA SENCILLA.",
    "troquelCode": "38",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-burgueseria@clientes.prograficos.local"
  },
  {
    "name": "CAJA COMBO.",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-burgueseria@clientes.prograficos.local"
  },
  {
    "name": "PORTA PAPAS",
    "troquelCode": "85",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.la-burgueseria@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA CANOA.",
    "troquelCode": "27",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.mr-sabor-burguers@clientes.prograficos.local"
  },
  {
    "name": "CAJA MAZORCADA",
    "troquelCode": "14",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.mr-sabor-burguers@clientes.prograficos.local"
  },
  {
    "name": "CAJA CON TAPA SIN PLASTIF. /ALITAS",
    "troquelCode": "8",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.mr-sabor-burguers@clientes.prograficos.local"
  },
  {
    "name": "CAJA DOMICILIO",
    "troquelCode": "49",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.la-cabanita@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA GRANDE.",
    "troquelCode": "21",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.lenos-parrilla@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA MEDIANA",
    "troquelCode": "29",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.lenos-parrilla@clientes.prograficos.local"
  },
  {
    "name": "EMPAQUE CONO",
    "troquelCode": "137",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.lenos-parrilla@clientes.prograficos.local"
  },
  {
    "name": "CAJA COMBO",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.lenos-parrilla@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA 20.14 CM",
    "troquelCode": "140",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.q-barbaro@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA 20.15 CM",
    "troquelCode": "141",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.q-barbaro@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA 17*12 CM / SOLO TROQ",
    "troquelCode": "138",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.q-barbaro@clientes.prograficos.local"
  },
  {
    "name": "PORTA PERROS",
    "troquelCode": "139",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.q-barbaro@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA",
    "troquelCode": "6",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.bufalo@clientes.prograficos.local"
  },
  {
    "name": "BOLSA JOYERIA",
    "troquelCode": "147",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.angelica-hernandez@clientes.prograficos.local"
  },
  {
    "name": "CAJA *6 TABLETAS NEVERAS",
    "troquelCode": "45 / S54",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.haceb@clientes.prograficos.local"
  },
  {
    "name": "CAJA *6 TABLETAS ESTUFAS Y MESONES",
    "troquelCode": "45 / S54",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.haceb@clientes.prograficos.local"
  },
  {
    "name": "CAJA *6 TABLETAS LAVADORAS Y LAVAV.",
    "troquelCode": "45 / S54",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.haceb@clientes.prograficos.local"
  },
  {
    "name": "IMPRESION -ADHESIVOS/ NEVERA -ESTUF.",
    "troquelCode": "SOLO IMPRESION Y CORTE",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.haceb@clientes.prograficos.local"
  },
  {
    "name": "CAJA DOMICILIO CHURRO SENCILLO",
    "troquelCode": "14",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.el-sabor-del-churro@clientes.prograficos.local"
  },
  {
    "name": "CAJA",
    "troquelCode": "153",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.minoxidil@clientes.prograficos.local"
  },
  {
    "name": "CAJA COMBO",
    "troquelCode": "14",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.next-level-burguer@clientes.prograficos.local"
  },
  {
    "name": "BANDEJA / DOBLE",
    "troquelCode": "80",
    "troquelSize": "MEDIUM",
    "thirdEmail": "contacto.next-level-burguer@clientes.prograficos.local"
  },
  {
    "name": "CAJA BASE/FUNDA DOBLE Y SENCILLA/NIDO",
    "troquelCode": "159",
    "troquelSize": "SMALL",
    "thirdEmail": "contacto.zora-sushi@clientes.prograficos.local"
  }
];

const paperSupplierSeeds = [
  {
    paperTypeName: "Optimo Kraft",
    supplierEmail: "compras@proveedorpapel.com",
    purchasePrice: "5200",
  },
  {
    paperTypeName: "Propalcote",
    supplierEmail: "compras@proveedorpapel.com",
    purchasePrice: "4600",
  },
  {
    paperTypeName: "Propalcote",
    supplierEmail: "ventas@dispapeles.com",
    purchasePrice: "4550",
  },
  {
    paperTypeName: "Bond",
    supplierEmail: "ventas@dispapeles.com",
    purchasePrice: "2100",
  },
];

const formatCatalog = [
  {
    name: "1 Pliego",
    sheet_divisions: 1,
    is_active: true,
    measures: [{ width: 100, height: 70 }],
  },
  {
    name: "1/2 Pliego",
    sheet_divisions: 2,
    is_active: true,
    measures: [{ width: 70, height: 50 }],
  },
  {
    name: "1/3 Pliego",
    sheet_divisions: 3,
    is_active: true,
    measures: [
      { width: 65, height: 35 },
      { width: 70, height: 33 },
    ],
  },
  {
    name: "1/4 Pliego",
    sheet_divisions: 4,
    is_active: true,
    measures: [
      { width: 50, height: 35 },
      { width: 70, height: 25 },
    ],
  },
  {
    name: "1/5 Pliego",
    sheet_divisions: 5,
    is_active: true,
    measures: [
      { width: 43, height: 27 },
      { width: 42, height: 28 },
      { width: 40, height: 30 },
    ],
  },
  {
    name: "1/6 Pliego",
    sheet_divisions: 6,
    is_active: true,
    measures: [
      { width: 50, height: 23 },
      { width: 35, height: 33 },
    ],
  },
  {
    name: "1/8 Pliego",
    sheet_divisions: 8,
    is_active: true,
    measures: [{ width: 35, height: 25 }],
  },
  {
    name: "1/9 Pliego",
    sheet_divisions: 9,
    is_active: true,
    measures: [{ width: 33, height: 23 }],
  },
  {
    name: "1/10 Pliego",
    sheet_divisions: 10,
    is_active: true,
    measures: [{ width: 28, height: 22 }],
  },
  {
    name: "1/12 Pliego",
    sheet_divisions: 12,
    is_active: true,
    measures: [
      { width: 33, height: 17.5 },
      { width: 25, height: 23 },
    ],
  },
  {
    name: "1/15 Pliego",
    sheet_divisions: 15,
    is_active: false,
    measures: [{ width: 23, height: 20 }],
  },
  {
    name: "1/16 Pliego",
    sheet_divisions: 16,
    is_active: false,
    measures: [{ width: 25, height: 17.5 }],
  },
  {
    name: "1/18 Pliego",
    sheet_divisions: 18,
    is_active: false,
    measures: [{ width: 23, height: 16.5 }],
  },
  {
    name: "1/20 Pliego",
    sheet_divisions: 20,
    is_active: false,
    measures: [{ width: 20, height: 17.5 }],
  },
  {
    name: "1/22 Pliego",
    sheet_divisions: 22,
    is_active: false,
    measures: [{ width: 22, height: 14 }],
  },
  {
    name: "1/24 Pliego",
    sheet_divisions: 24,
    is_active: false,
    measures: [{ width: 17.5, height: 16.5 }],
  },
  {
    name: "1/25 Pliego",
    sheet_divisions: 25,
    is_active: false,
    measures: [{ width: 20, height: 14 }],
  },
  {
    name: "1/32 Pliego",
    sheet_divisions: 32,
    is_active: false,
    measures: [{ width: 17.5, height: 12.5 }],
  },
  {
    name: "1/36 Pliego",
    sheet_divisions: 36,
    is_active: false,
    measures: [{ width: 16.5, height: 11.5 }],
  },
  {
    name: "1/132 Pliego",
    sheet_divisions: 132,
    is_active: false,
    measures: [{ width: 9, height: 5.5 }],
  },
];

const demoOrderBlueprints = [
  {
    "productName": "CAJA COMPLEMENTO",
    "thirdEmail": "contacto.king-broasted@clientes.prograficos.local",
    "measureFormatName": "1/4 Pliego",
    "measureSize": {
      "width": 50,
      "height": 35
    },
    "paperTypeName": "Optimo Kraft",
    "cavities": 1,
    "amount_sheets": 250,
    "total_estimated": 1000,
    "order_status": "PENDIENTE"
  },
  {
    "productName": "CAJA ALITAS",
    "thirdEmail": "contacto.masabor@clientes.prograficos.local",
    "measureFormatName": "1/4 Pliego",
    "measureSize": {
      "width": 50,
      "height": 35
    },
    "paperTypeName": "Propalcote",
    "cavities": 2,
    "amount_sheets": 120,
    "total_estimated": 1920,
    "order_status": "EN_PROCESO"
  },
  {
    "productName": "CAJA DE BOX",
    "thirdEmail": "contacto.la-granja-b@clientes.prograficos.local",
    "measureFormatName": "1/4 Pliego",
    "measureSize": {
      "width": 50,
      "height": 35
    },
    "paperTypeName": "Bond",
    "cavities": 1,
    "amount_sheets": 180,
    "total_estimated": 1080,
    "order_status": "TERMINADO"
  }
];

const parseBulkOrdersCount = () => {
  const cliArg = process.argv.find((arg) => arg.startsWith("--bulk-orders="));
  const rawValue = cliArg?.split("=")[1] ?? process.env.SEED_BULK_ORDERS ?? "0";
  const parsedValue = Number.parseInt(rawValue, 10);

  return Number.isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (items) => items[randomInt(0, items.length - 1)];

const createDateOffset = (baseDate, daysOffset) => {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + daysOffset);
  return nextDate;
};

async function syncProcessDefinitions(process, fields) {
  for (const [index, field] of fields.entries()) {
    await prisma.process_Field_Definition.upsert({
      where: {
        process_id_key: {
          process_id: process.id,
          key: field.key,
        },
      },
      update: {
        label: field.label,
        field_type: field.field_type,
        is_required: Boolean(field.is_required),
        sort_order: index + 1,
        options: field.options ?? null,
        // Si el campo estaba soft-deleteado y vuelve al blueprint, se revive.
        deleted_at: null,
      },
      create: {
        process_id: process.id,
        key: field.key,
        label: field.label,
        field_type: field.field_type,
        is_required: Boolean(field.is_required),
        sort_order: index + 1,
        options: field.options ?? null,
      },
    });
  }

  // Soft-delete de los campos que ya no están en el blueprint (idempotencia):
  // conserva el historial en detail_process_field_values pero deja de mostrarlos.
  const keptKeys = fields.map((field) => field.key);
  await prisma.process_Field_Definition.updateMany({
    where: {
      process_id: process.id,
      key: { notIn: keptKeys.length ? keptKeys : ["__none__"] },
      deleted_at: null,
    },
    data: { deleted_at: new Date() },
  });
}

const getMachineryForProcess = (processCategory, machineryByType) => {
  const categoryMap = {
    CORTE: ["GUILLOTINA"],
    IMPRESION: ["IMPRESORA_OFFSET", "IMPRESORA_DIGITAL"],
    ACABADO: ["PLASTIFICADORA"],
    TROQUELADO: ["TROQUELADORA"],
    PEGADO: ["PEGADORA"],
  };

  const candidates = (categoryMap[processCategory] || [])
    .flatMap((type) => machineryByType.get(type) || [])
    .filter(Boolean);

  return candidates.length ? pickRandom(candidates) : null;
};

const buildDetailState = ({
  processIndex,
  selectedProcesses,
  orderStatus,
  totalEstimated,
}) => {
  const defaultDetail = {
    process_state: "PENDIENTE",
    quantity_delivered: 0,
    quantity_damaged: 0,
    start_date: null,
    end_date: null,
    start_hour: null,
    end_hour: null,
  };

  if (orderStatus === "PENDIENTE") {
    return defaultDetail;
  }

  const now = new Date();
  const startedAt = createDateOffset(now, -randomInt(1, 10));
  const finishedAt = createDateOffset(startedAt, randomInt(0, 1));

  if (orderStatus === "EN_PROCESO") {
    if (processIndex < selectedProcesses.length - 1) {
      return {
        ...defaultDetail,
        process_state: "TERMINADO",
        quantity_delivered: Math.max(0, totalEstimated - randomInt(0, 80)),
        quantity_damaged: randomInt(0, 20),
        start_date: startedAt,
        end_date: finishedAt,
        start_hour: startedAt,
        end_hour: finishedAt,
      };
    }

    return {
      ...defaultDetail,
      process_state: "EN_PROCESO",
      quantity_delivered: Math.max(0, totalEstimated - randomInt(30, 120)),
      quantity_damaged: randomInt(0, 10),
      start_date: startedAt,
      start_hour: startedAt,
    };
  }

  return {
    ...defaultDetail,
    process_state: "TERMINADO",
    quantity_delivered: Math.max(0, totalEstimated - randomInt(0, 60)),
    quantity_damaged: randomInt(0, 15),
    start_date: startedAt,
    end_date: finishedAt,
    start_hour: startedAt,
    end_hour: finishedAt,
  };
};

async function seedUsers() {
  const salt = await bcrypt.genSalt(10);

  for (const userSeed of userSeeds) {
    await prisma.user.upsert({
      where: { email: userSeed.email },
      update: {
        name: userSeed.name,
        surename: userSeed.surename,
        role: userSeed.role,
        is_active: true,
      },
      create: {
        ...userSeed,
        password: await bcrypt.hash(userSeed.password, salt),
        is_active: true,
      },
    });
  }
}

// Administrador para producción: toma email y contraseña de variables de
// entorno (no hay credenciales quemadas). No resetea la contraseña si el
// usuario ya existe, para no pisar un cambio hecho en la app.
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "⚠️ seed:admin requiere ADMIN_EMAIL y ADMIN_PASSWORD. Operación omitida.",
    );
    return;
  }

  const name = process.env.ADMIN_NAME?.trim() || "Administrador";
  const surename = process.env.ADMIN_SURENAME?.trim() || "Prográficos";
  const salt = await bcrypt.genSalt(10);

  await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      is_active: true,
    },
    create: {
      name,
      surename,
      email,
      password: await bcrypt.hash(password, salt),
      role: "ADMIN",
      is_active: true,
    },
  });

  console.log(`✅ Administrador listo (${email})`);
}

async function seedProcesses(machineryByRef = {}) {
  for (const blueprint of processBlueprints) {
    const process = await prisma.process.upsert({
      where: { name: blueprint.name },
      update: {
        order: blueprint.order,
        category: blueprint.category,
        is_active: true,
      },
      create: {
        name: blueprint.name,
        order: blueprint.order,
        category: blueprint.category,
        is_active: true,
      },
    });

    await syncProcessDefinitions(process, blueprint.fields);

    const machineryIds = (blueprint.machineryRefs || [])
      .map((ref) => machineryByRef[ref]?.id)
      .filter(Boolean);

    if (machineryIds.length > 0) {
      await prisma.processMachinery.deleteMany({
        where: { process_id: process.id },
      });
      await prisma.processMachinery.createMany({
        data: machineryIds.map((machineryId) => ({
          process_id: process.id,
          machinery_id: machineryId,
        })),
      });
    }
  }
}

async function seedMachinery() {
  const machineryByRef = {};
  for (const machinerySeed of machinerySeeds) {
    const record = await prisma.machinery.upsert({
      where: { reference: machinerySeed.reference },
      update: {
        name: machinerySeed.name,
        type: machinerySeed.type,
        is_active: true,
      },
      create: {
        ...machinerySeed,
        is_active: true,
      },
    });
    machineryByRef[record.reference] = record;
  }
  return machineryByRef;
}

async function seedTroqueles() {
  for (const troquelSeed of troquelSeeds) {
    await prisma.troqueles.upsert({
      where: {
        size_code: {
          size: troquelSeed.size,
          code: troquelSeed.code,
        },
      },
      update: {
        size: troquelSeed.size,
        file_name: troquelSeed.file_name,
        file: troquelSeed.file,
        is_active: true,
      },
      create: {
        ...troquelSeed,
        is_active: true,
      },
    });
  }
}

async function seedFormatsAndMeasures() {
  for (const formatSeed of formatCatalog) {
    const format = await prisma.format.upsert({
      where: { name: formatSeed.name },
      update: {
        sheet_divisions: formatSeed.sheet_divisions,
        is_active: formatSeed.is_active,
      },
      create: {
        name: formatSeed.name,
        sheet_divisions: formatSeed.sheet_divisions,
        is_active: formatSeed.is_active,
      },
    });

    for (const measureSeed of formatSeed.measures) {
      const existingMeasure = await prisma.measure.findFirst({
        where: {
          width: measureSeed.width,
          height: measureSeed.height,
          format_id: format.id,
        },
      });

      if (existingMeasure) {
        await prisma.measure.update({
          where: { id: existingMeasure.id },
          data: { is_active: true },
        });
        continue;
      }

      await prisma.measure.create({
        data: {
          width: measureSeed.width,
          height: measureSeed.height,
          format_id: format.id,
          is_active: true,
        },
      });
    }
  }
}

async function seedPaperTypes() {
  for (const paperTypeSeed of paperTypeSeeds) {
    const existingPaperType = await prisma.paper_Type.findFirst({
      where: {
        name: paperTypeSeed.name,
        description: paperTypeSeed.description,
        grammage: paperTypeSeed.grammage,
      },
    });

    if (existingPaperType) {
      await prisma.paper_Type.update({
        where: { id: existingPaperType.id },
        data: { is_active: true },
      });
      continue;
    }

    await prisma.paper_Type.create({
      data: {
        ...paperTypeSeed,
        is_active: true,
      },
    });
  }
}

async function seedThirds() {
  for (const thirdSeed of thirdSeeds) {
    await prisma.thirds.upsert({
      where: { email: thirdSeed.email },
      update: {
        ...thirdSeed,
        is_active: true,
      },
      create: {
        ...thirdSeed,
        is_active: true,
      },
    });
  }
}

async function seedPaperSuppliers() {
  for (const relation of paperSupplierSeeds) {
    const paperType = await prisma.paper_Type.findFirst({
      where: { name: relation.paperTypeName },
    });
    const supplier = await prisma.thirds.findUnique({
      where: { email: relation.supplierEmail },
    });

    if (!paperType || !supplier) continue;

    await prisma.paperTypeSupplier.upsert({
      where: {
        paper_type_id_third_id: {
          paper_type_id: paperType.id,
          third_id: supplier.id,
        },
      },
      update: {
        purchase_price: relation.purchasePrice,
      },
      create: {
        paper_type_id: paperType.id,
        third_id: supplier.id,
        purchase_price: relation.purchasePrice,
      },
    });
  }
}

async function seedProducts() {
  for (const productSeed of productSeeds) {
    const troquel = await prisma.troqueles.findFirst({
      where: {
        code: productSeed.troquelCode,
        size: productSeed.troquelSize,
      },
    });
    const third = await prisma.thirds.findUnique({
      where: { email: productSeed.thirdEmail },
    });

    if (!troquel || !third) continue;

    const existingProduct = await prisma.product.findFirst({
      where: {
        name: productSeed.name,
        troquel_id: troquel.id,
        third_id: third.id,
      },
    });

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          name: productSeed.name,
          troquel_id: troquel.id,
          third_id: third.id,
          is_active: true,
        },
      });
      continue;
    }

    await prisma.product.create({
      data: {
        name: productSeed.name,
        troquel_id: troquel.id,
        third_id: third.id,
        is_active: true,
      },
    });
  }
}

async function seedDemoOrders() {
  const existingOrders = await prisma.header_Production_Order.count();

  if (existingOrders > 0) {
    console.log("ℹ️ Ya existen órdenes registradas. Se omiten órdenes demo.");
    return;
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@prograficos.com" },
  });
  const processes = await prisma.process.findMany({
    where: { is_active: true },
    orderBy: { order: "asc" },
  });
  const machinery = await prisma.machinery.findMany({
    where: { is_active: true },
    select: { id: true, type: true },
  });
  const machineryByType = machinery.reduce((map, item) => {
    const current = map.get(item.type) || [];
    current.push(item.id);
    map.set(item.type, current);
    return map;
  }, new Map());

  for (const blueprint of demoOrderBlueprints) {
    const product = await prisma.product.findFirst({
      where: {
        name: blueprint.productName,
        is_active: true,
        third: {
          is: {
            email: blueprint.thirdEmail,
          },
        },
      },
      include: { troquel: true },
    });
    const measure = await prisma.measure.findFirst({
      where: {
        width: blueprint.measureSize.width,
        height: blueprint.measureSize.height,
        format: {
          is: {
            name: blueprint.measureFormatName,
          },
        },
        is_active: true,
      },
      include: { format: true },
    });
    const paperType = await prisma.paper_Type.findFirst({
      where: { name: blueprint.paperTypeName, is_active: true },
    });

    if (!product || !measure || !paperType || !adminUser) continue;

    const selectedProcesses = processes.slice(
      0,
      blueprint.order_status === "PENDIENTE" ? 3 : processes.length,
    );

    const detailRecords = selectedProcesses.map((process, processIndex) => {
      const detailState = buildDetailState({
        processIndex,
        selectedProcesses,
        orderStatus: blueprint.order_status,
        totalEstimated: blueprint.total_estimated,
      });

      return {
        process_id: process.id,
        measure_cutting_id: measure.id,
        machinery_id: getMachineryForProcess(process.category, machineryByType),
        user_id:
          detailState.process_state === "PENDIENTE" ? null : adminUser.id,
        observations: `Orden demo seed · ${process.name}`,
        ...detailState,
      };
    });

    await prisma.header_Production_Order.create({
      data: {
        date: createDateOffset(new Date(), -randomInt(2, 20)),
        order_status: blueprint.order_status,
        amount_sheets: blueprint.amount_sheets,
        cavities: blueprint.cavities,
        total_estimated: blueprint.total_estimated,
        total_delivered:
          blueprint.order_status === "TERMINADO"
            ? blueprint.total_estimated - 12
            : null,
        total_damaged: blueprint.order_status === "TERMINADO" ? 12 : null,
        measure_id: measure.id,
        paper_type_id: paperType.id,
        troquel_id: product.troquel_id,
        product_id: product.id,
        user_id: adminUser.id,
        detail_production_orders: {
          create: detailRecords,
        },
      },
    });
  }
}

async function seedBulkOrders(bulkOrdersCount) {
  if (!bulkOrdersCount) return;

  console.log(`📦 Preparando ${bulkOrdersCount} órdenes masivas de prueba...`);

  const [users, measures, paperTypes, products, processes, machinery] =
    await Promise.all([
      prisma.user.findMany({
        where: { is_active: true },
        select: { id: true },
      }),
      prisma.measure.findMany({
        where: { is_active: true },
        include: { format: true },
      }),
      prisma.paper_Type.findMany({
        where: { is_active: true },
        select: { id: true },
      }),
      prisma.product.findMany({
        where: { is_active: true },
        select: { id: true, troquel_id: true },
      }),
      prisma.process.findMany({
        where: { is_active: true },
        select: { id: true, order: true, category: true },
        orderBy: { order: "asc" },
      }),
      prisma.machinery.findMany({
        where: { is_active: true },
        select: { id: true, type: true },
      }),
    ]);

  if (
    !users.length ||
    !measures.length ||
    !paperTypes.length ||
    !products.length ||
    !processes.length
  ) {
    throw new Error(
      "No hay catálogo suficiente para crear órdenes masivas de prueba",
    );
  }

  const machineryByType = machinery.reduce((map, item) => {
    const current = map.get(item.type) || [];
    current.push(item.id);
    map.set(item.type, current);
    return map;
  }, new Map());

  for (let index = 0; index < bulkOrdersCount; index += 1) {
    const product = pickRandom(products);
    const measure = pickRandom(measures);
    const user = pickRandom(users);
    const paperType = pickRandom(paperTypes);
    const cavities = randomInt(1, 4);
    const unitsPerSheet =
      Math.max(1, Number(measure.format?.sheet_divisions || 1)) * cavities;
    const amountSheets = randomInt(80, 800);
    const totalEstimated = amountSheets * unitsPerSheet;
    const orderStatus = pickRandom(["PENDIENTE", "EN_PROCESO", "TERMINADO"]);
    const selectedProcesses = processes.slice(
      0,
      randomInt(2, processes.length),
    );

    const detailRecords = selectedProcesses.map((process, processIndex) => {
      const detailState = buildDetailState({
        processIndex,
        selectedProcesses,
        orderStatus,
        totalEstimated,
      });

      return {
        process_id: process.id,
        measure_cutting_id: measure.id,
        machinery_id: getMachineryForProcess(process.category, machineryByType),
        user_id: detailState.process_state === "PENDIENTE" ? null : user.id,
        observations: `Carga masiva seed #${index + 1} · ${process.name}`,
        ...detailState,
      };
    });

    await prisma.header_Production_Order.create({
      data: {
        date: createDateOffset(new Date(), -randomInt(1, 120)),
        order_status: orderStatus,
        amount_sheets: amountSheets,
        cavities,
        total_estimated: totalEstimated,
        total_delivered:
          orderStatus === "TERMINADO"
            ? Math.max(0, totalEstimated - randomInt(0, 80))
            : null,
        total_damaged: orderStatus === "TERMINADO" ? randomInt(0, 25) : null,
        measure_id: measure.id,
        paper_type_id: paperType.id,
        troquel_id: product.troquel_id,
        product_id: product.id,
        user_id: user.id,
        detail_production_orders: {
          create: detailRecords,
        },
      },
    });

    if ((index + 1) % 50 === 0 || index === bulkOrdersCount - 1) {
      console.log(
        `🧱 Órdenes masivas creadas: ${index + 1}/${bulkOrdersCount}`,
      );
    }
  }
}

// Modo del seed: "catalogs" (maestros, seguro en producción),
// "demo" (usuarios y órdenes de prueba, solo local) o "all" (ambos).
function parseSeedMode() {
  const arg = process.argv.find((value) => value.startsWith("--mode="));
  const mode = arg?.split("=")[1] || process.env.SEED_MODE || "all";
  return ["catalogs", "demo", "admin", "all"].includes(mode) ? mode : "all";
}

// Catálogos / datos maestros. Idempotente y seguro para producción.
async function seedCatalogs() {
  const machineryByRef = await seedMachinery();
  console.log("✅ Maquinaria lista");

  await seedProcesses(machineryByRef);
  console.log("✅ Procesos, campos y maquinaria asociada listos");

  await seedTroqueles();
  console.log("✅ Troqueles listos");

  await seedFormatsAndMeasures();
  console.log("✅ Formatos y medidas listos");

  await seedPaperTypes();
  console.log("✅ Tipos de papel listos");

  await seedThirds();
  console.log("✅ Terceros listos");

  await seedPaperSuppliers();
  console.log("✅ Relación de proveedores y papeles lista");

  await seedProducts();
  console.log("✅ Productos listos");
}

// Datos de prueba/relleno. NO ejecutar en producción: crea usuarios con
// contraseñas conocidas y órdenes ficticias. Requiere catálogos ya sembrados.
async function seedDemo(bulkOrdersCount) {
  await seedUsers();
  console.log("✅ Usuarios demo listos");

  await seedDemoOrders();
  console.log("✅ Órdenes demo listas");

  await seedBulkOrders(bulkOrdersCount);
}

async function main() {
  const mode = parseSeedMode();
  console.log(`🌱 Iniciando seed (modo: ${mode})...`);
  const bulkOrdersCount = parseBulkOrdersCount();

  if (mode === "catalogs" || mode === "all") {
    await seedCatalogs();
  }

  if (mode === "demo" || mode === "all") {
    await seedDemo(bulkOrdersCount);
  }

  if (mode === "admin") {
    await seedAdmin();
  }

  console.log("🎉 Seed ejecutado correctamente");
}

main()
  .catch((error) => {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
