import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    width: 595,
    height: 842,
    padding: 0,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    marginTop: 17,
    marginHorizontal: 26,
    height: 122,
    backgroundColor: "#F6F8FC",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  logoBox: {
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
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 8,
  },
  headerLine: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginTop: 1,
  },
  companyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#000000",
  },
  companyDetail: {
    fontSize: 10,
    color: "#000000",
    marginTop: 2,
  },
  contactLine: {
    fontSize: 10,
    color: "#000000",
    textAlign: "right",
    marginTop: 2,
  },
  offerTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: "#000000",
    textAlign: "right",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginTop: 8,
    marginBottom: 8,
  },
  body: {
    marginHorizontal: 52,
    marginTop: 16,
  },
  intro: {
    fontSize: 12,
    color: "#000000",
    lineHeight: 1.4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    color: "#7252FF",
    marginBottom: 8,
    marginTop: 12,
  },
  serviceItem: {
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 12,
    color: "#7252FF",
    marginRight: 6,
    marginTop: 3,
  },
  serviceText: {
    fontSize: 12,
    color: "#000000",
    lineHeight: 1.4,
    flex: 1,
  },
  tableContainer: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#DFE4EA",
    borderRadius: 3,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DFE4EA",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#0A2540",
    lineHeight: 1,
  },
  colQty: { width: 30 },
  colDesc: { width: 200 },
  colTotal: { width: 80, textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DFE4EA",
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cellText: {
    fontSize: 10,
    color: "#0A2540",
    lineHeight: 1,
  },
  cellCenter: {
    fontSize: 10,
    color: "#0A2540",
    lineHeight: 1,
    textAlign: "center",
    width: 30,
  },
  cellDesc: {
    fontSize: 8,
    color: "#0A2540",
    lineHeight: 1.1,
    width: 200,
  },
  cellTotal: {
    fontSize: 10,
    color: "#0A2540",
    lineHeight: 1,
    textAlign: "right",
    width: 80,
  },
  totalBox: {
    marginTop: 8,
    backgroundColor: "#F6F8FC",
    borderRadius: 4,
    padding: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#0A2540",
    marginRight: 8,
  },
  totalAmount: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#0A2540",
  },
  notes: {
    fontSize: 8,
    color: "#0A2540",
    marginTop: 8,
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
    height: 1,
    backgroundColor: "#E5E5E5",
    marginBottom: 8,
    width: 535,
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
    bottom: 60,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
});

function formatPrice(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} €`;
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
        <View style={styles.bottomLine} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            {props.logoBase64 ? (
              <Image style={styles.logoImage} src={props.logoBase64} />
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>
              Adimen Intelligence Services S.L.
            </Text>
            <Text style={styles.companyDetail}>
              NIF: ES454425977
            </Text>
            <Text style={styles.contactLine}>
              adimenai.tech@gmail.com | +34 650 60 90 28
            </Text>
            <Text style={styles.offerTitle}>Oferta comercial</Text>
          </View>
        </View>

        <View style={{ marginHorizontal: 26 }}>
          <View style={styles.divider} />
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.intro}>
            {props.introduction || "Presupuesto para:"}
          </Text>

          <Text style={[styles.companyDetail, { marginBottom: 4 }]}>
            {props.clientName}
          </Text>
          {props.clientNif ? (
            <Text style={styles.companyDetail}>NIF: {props.clientNif}</Text>
          ) : null}
          {props.clientAddress ? (
            <Text style={styles.companyDetail}>{props.clientAddress}</Text>
          ) : null}
          {props.clientEmail || props.clientPhone ? (
            <Text style={styles.contactLine}>
              {props.clientEmail}{props.clientEmail && props.clientPhone ? " | " : ""}{props.clientPhone}
            </Text>
          ) : null}

          {/* Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Cantidad</Text>
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
                <Text style={styles.cellCenter}>
                  {String(item.quantity).padStart(2, "0")}
                </Text>
                <Text style={styles.cellDesc}>{item.title}</Text>
                <Text style={styles.cellTotal}>
                  {item.unitPrice > 0
                    ? `${formatPrice(item.total)}${item.quantity > 1 ? ` (${formatPrice(item.unitPrice)}/ud)` : ""}`
                    : formatPrice(item.total)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>SUBTOTAL:</Text>
            <Text style={styles.totalAmount}>{formatPrice(props.subtotal)}</Text>
          </View>
          <View style={[styles.totalBox, { marginTop: 4 }]}>
            <Text style={styles.totalLabel}>IVA ({props.taxRate}%):</Text>
            <Text style={styles.totalAmount}>{formatPrice(props.taxAmount)}</Text>
          </View>
          <View style={[styles.totalBox, { marginTop: 4 }]}>
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
          <Text style={{ fontSize: 8, color: "#000000" }}>
            Adimen Intelligence Services S.L. | adimenai.tech@gmail.com | +34 650 60 90 28
          </Text>
        </View>
      </Page>
    </Document>
  );
}
