import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

Font.register({
  family: "Lato",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ.woff2",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTcvnYwYZ9kI.woff2",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    width: 595,
    height: 842,
    backgroundColor: "#FFFFFF",
    fontFamily: "Lato",
    position: "relative",
  },
  leftBar: {
    position: "absolute",
    left: 26,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#E5E5E5",
  },
  rightBar: {
    position: "absolute",
    right: 26,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#E5E5E5",
  },
  bottomLine: {
    position: "absolute",
    bottom: 12,
    left: 26,
    right: 26,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  footerDivider: {
    position: "absolute",
    top: 779,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  headerBg: {
    position: "absolute",
    left: 26,
    top: 17,
    width: 543,
    height: 122,
    backgroundColor: "#F6F8FC",
  },
  divider: {
    position: "absolute",
    left: 26,
    right: 26,
    top: 140,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  logoBox: {
    position: "absolute",
    left: 52,
    top: 89,
    width: 86,
    height: 86,
    backgroundColor: "#1C1135",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 42,
    height: 43,
  },
  offerTitle: {
    fontFamily: "Inter",
    position: "absolute",
    right: 42,
    top: 45,
    fontSize: 18,
    fontWeight: 700,
    color: "#000000",
  },
  companyName: {
    position: "absolute",
    right: 42,
    top: 64,
    fontSize: 12,
    fontWeight: 700,
    color: "#000000",
  },
  companyDetail: {
    position: "absolute",
    right: 42,
    top: 80,
    fontSize: 10,
    color: "#000000",
  },
  clientAddress: {
    position: "absolute",
    right: 42,
    top: 94,
    fontSize: 10,
    color: "#000000",
    lineHeight: 1.1,
  },
  contactLine: {
    position: "absolute",
    right: 42,
    top: 108,
    fontSize: 10,
    color: "#000000",
  },
  body: {
    marginLeft: 52,
    marginRight: 52,
    marginTop: 61,
  },
  intro: {
    fontSize: 15,
    lineHeight: 1.5,
    color: "#000000",
    marginBottom: 32,
  },
  clientSection: {
    marginBottom: 32,
  },
  clientNameText: {
    fontSize: 12,
    fontWeight: 700,
    color: "#000000",
    marginBottom: 4,
  },
  clientDetailText: {
    fontSize: 10,
    color: "#000000",
    marginBottom: 2,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#DFE4EA",
    borderRadius: 3,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DFE4EA",
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  tableHeaderText: {
    fontFamily: "Lato",
    fontSize: 10,
    fontWeight: 700,
    color: "#0A2540",
    lineHeight: 1,
  },
  colCant: { width: 60, textAlign: "center" },
  colDesc: { flex: 1 },
  colTotal: { width: 100, textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DFE4EA",
    paddingVertical: 5,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cellCant: {
    width: 60,
    fontSize: 10,
    color: "#0A2540",
    lineHeight: 1,
    textAlign: "center",
  },
  cellDesc: {
    flex: 1,
    fontSize: 8,
    color: "#0A2540",
    lineHeight: 1.1,
  },
  cellTotal: {
    width: 100,
    fontSize: 10,
    color: "#0A2540",
    lineHeight: 1,
    textAlign: "right",
  },
  totalBox: {
    backgroundColor: "#F6F8FC",
    borderRadius: 4,
    padding: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 6,
  },
  totalBoxFinal: {
    backgroundColor: "#F6F8FC",
    borderRadius: 4,
    padding: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0A2540",
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0A2540",
  },
  notes: {
    fontSize: 8,
    color: "#0A2540",
    lineHeight: 1.1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 26,
    right: 26,
    height: 51,
    backgroundColor: "#F6F8FC",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  footerText: {
    fontSize: 8,
    color: "#000000",
  },
});

function formatPrice(n: number): string {
  const f = n.toFixed(2).replace(".", ",");
  const [int, dec] = f.split(",");
  const withThousandSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousandSep},${dec} €`;
}

type PresupuestoPDFProps = {
  number: string;
  clientName: string;
  clientNif?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  introduction: string;
  items: Array<{
    title: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  logoBase64?: string;
};

export function PresupuestoPDF(props: PresupuestoPDFProps) {
  return (
    <Document>
      <Page size={[595, 842]} style={styles.page}>
        <View style={styles.leftBar} />
        <View style={styles.rightBar} />
        <View style={styles.footerDivider} />
        <View style={styles.bottomLine} />
        <View style={styles.headerBg} />
        <View style={styles.divider} />

        {/* Logo */}
        <View style={styles.logoBox}>
          {props.logoBase64 ? (
            <Image style={styles.logoImage} src={props.logoBase64} />
          ) : null}
        </View>

        {/* Header text */}
        <Text style={styles.offerTitle}>Oferta comercial</Text>
        <Text style={styles.companyName}>
          Adimen Intelligence Services S.L.
        </Text>
        <Text style={styles.companyDetail}>NIF: ES454425977</Text>
        <Text style={styles.clientAddress}>Kalea/Lorem Ipsum dolor</Text>
        <Text style={styles.contactLine}>
          adimenai.tech@gmail.com | +34 650 60 90 28
        </Text>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.intro}>
            {props.introduction || "Presupuesto para:"}
          </Text>

          <View style={styles.clientSection}>
            <Text style={styles.clientNameText}>{props.clientName}</Text>
            {props.clientNif ? (
              <Text style={styles.clientDetailText}>NIF: {props.clientNif}</Text>
            ) : null}
            {props.clientAddress ? (
              <Text style={styles.clientDetailText}>{props.clientAddress}</Text>
            ) : null}
            {props.clientEmail || props.clientPhone ? (
              <Text style={[styles.clientDetailText, { marginTop: 4 }]}>
                {props.clientEmail}{props.clientEmail && props.clientPhone ? " | " : ""}{props.clientPhone}
              </Text>
            ) : null}
          </View>

          {/* Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colCant]}>Cantidad</Text>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Descripción</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
            </View>
            {props.items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  ...(index === props.items.length - 1 ? [styles.lastRow] : []),
                ]}
              >
                <Text style={styles.cellCant}>
                  {String(item.quantity).padStart(2, "0")}
                </Text>
                <Text style={styles.cellDesc}>{item.title}</Text>
                <Text style={styles.cellTotal}>{formatPrice(item.total)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>SUBTOTAL:</Text>
            <Text style={styles.totalAmount}>{formatPrice(props.subtotal)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>IVA ({props.taxRate}%):</Text>
            <Text style={styles.totalAmount}>{formatPrice(props.taxAmount)}</Text>
          </View>
          <View style={styles.totalBoxFinal}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalAmount}>{formatPrice(props.total)}</Text>
          </View>

          {props.notes ? (
            <Text style={styles.notes}>{props.notes}</Text>
          ) : (
            <Text style={styles.notes}>
              (*) Precios sin IVA. Se aplicará el tipo impositivo vigente en el
              momento de la facturación
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>
            Adimen Intelligence Services S.L. | adimenai.tech@gmail.com | +34 650 60 90 28
          </Text>
        </View>
      </Page>
    </Document>
  );
}
