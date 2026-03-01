import {
  address,
  company,
  datatype,
  internet,
  lorem,
  phone,
  random,
} from "faker/locale/en_US";

import { randomDate } from "./utils";
import { defaultCompanySectors } from "../../../root/defaultConfiguration";
import type { Company, CompanyType, ClientType, RAFile } from "../../../types";
import type { Db } from "./types";

const sizes = [1, 10, 50, 250, 500];
const companyTypes: CompanyType[] = ["Client", "Partner", "Supplier", "Business Division"];
const clientTypes: ClientType[] = ["Agency", "Advertiser", "Publisher"];

const regex = /\W+/;

export const generateCompanies = (db: Db, size = 55): Required<Company>[] => {
  return Array.from(Array(size).keys()).map((id) => {
    const name = company.companyName();
    const companyType = random.arrayElement(companyTypes);

    return {
      id,
      name: name,
      logo: {
        title: lorem.text(1),
        src: `./logos/${id}.png`,
      } as RAFile,
      type: companyType,
      client_type: companyType === "Client" ? random.arrayElement(clientTypes) : undefined,
      sector: random.arrayElement(defaultCompanySectors),
      size: random.arrayElement(sizes) as 1 | 10 | 50 | 250 | 500,
      linkedin_url: `https://www.linkedin.com/company/${name
        .toLowerCase()
        .replace(regex, "_")}`,
      website: internet.url(),
      phone_number: phone.phoneNumber(),
      address: address.streetAddress(),
      zipcode: address.zipCode(),
      city: address.city(),
      stateAbbr: address.stateAbbr(),
      nb_contacts: 0,
      nb_deals: 0,
      // at least 1/3rd of companies for Jane Doe
      sales_id: datatype.number(2) === 0 ? 0 : random.arrayElement(db.sales).id,
      created_at: randomDate().toISOString(),
      description: lorem.paragraph(),
      revenue: random.arrayElement(["$1M", "$10M", "$100M", "$1B"]),
      tax_identifier: random.alphaNumeric(10),
      country: random.arrayElement(["USA", "France", "UK"]),
      context_links: [],
    };
  });
};
