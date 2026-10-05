export interface StoreOutletInfo {
  code: string;
  name: string;
  city: string;
  model: "FOCO" | "COCO";
  manager: string;
  email: string;
  activeStaff: number;
}

export const ALL_NETWORK_STORES: StoreOutletInfo[] = [
  {
    code: "OUT-042",
    name: "Hazratganj Flagship",
    city: "Lucknow",
    model: "FOCO",
    manager: "Store Operator",
    email: "store.lucknow@franchiseops.com",
    activeStaff: 14,
  },
  {
    code: "OUT-089",
    name: "Sector 18 Market",
    city: "Noida",
    model: "COCO",
    manager: "Sanjay Dixit",
    email: "store.noida@franchiseops.com",
    activeStaff: 18,
  },
  {
    code: "OUT-114",
    name: "Koramangala 5th Block",
    city: "Bengaluru",
    model: "FOCO",
    manager: "Anita Rao",
    email: "store.blr@franchiseops.com",
    activeStaff: 16,
  },
  {
    code: "OUT-019",
    name: "Connaught Place Inner",
    city: "Delhi",
    model: "COCO",
    manager: "Ramesh Mehra",
    email: "store.delhi@franchiseops.com",
    activeStaff: 22,
  },
  {
    code: "OUT-055",
    name: "FC Road Corner",
    city: "Pune",
    model: "COCO",
    manager: "Vikram Patil",
    email: "store.pune@franchiseops.com",
    activeStaff: 12,
  },
  {
    code: "OUT-073",
    name: "MI Road Heritage",
    city: "Jaipur",
    model: "FOCO",
    manager: "Gaurav Sharma",
    email: "store.jaipur@franchiseops.com",
    activeStaff: 15,
  },
  {
    code: "OUT-128",
    name: "Bandra West Linking Road",
    city: "Mumbai",
    model: "COCO",
    manager: "Pooja Mehta",
    email: "store.mumbai@franchiseops.com",
    activeStaff: 20,
  },
  {
    code: "OUT-142",
    name: "Cyber Hub Galleria",
    city: "Gurgaon",
    model: "FOCO",
    manager: "Deepak Verma",
    email: "store.gurgaon@franchiseops.com",
    activeStaff: 17,
  },
  {
    code: "OUT-061",
    name: "Civil Lines Cantt",
    city: "Kanpur",
    model: "FOCO",
    manager: "Amit Shukla",
    email: "store.kanpur@franchiseops.com",
    activeStaff: 13,
  },
  {
    code: "OUT-097",
    name: "Assi Ghat Promenade",
    city: "Varanasi",
    model: "COCO",
    manager: "Rajesh Mishra",
    email: "store.varanasi@franchiseops.com",
    activeStaff: 14,
  },
];

export const STORES_MAP: Record<string, StoreOutletInfo> = ALL_NETWORK_STORES.reduce(
  (acc, store) => {
    acc[store.code] = store;
    return acc;
  },
  {} as Record<string, StoreOutletInfo>
);

export function getStoreDisplayName(storeId: string): string {
  const store = STORES_MAP[storeId];
  if (store) {
    return `${store.name} (${store.city})`;
  }
  return `Store ${storeId}`;
}
