/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const PAGE_W = 595;
const PAGE_H = 842;

const styles = StyleSheet.create({
  page: {
    width: PAGE_W,
    height: PAGE_H,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    position: "relative",
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
  logoImg: { width: 43, height: 44 },

  invoiceTitle: {
    position: "absolute",
    right: 72,
    top: 45,
    fontSize: 16,
    textAlign: "right",
  },
  titleLight: { fontWeight: 400 },
  titleSep: { fontWeight: 400 },
  titleBold: { fontWeight: 700 },

  senderBlock: {
    position: "absolute",
    right: 72,
    top: 68,
    alignItems: "flex-end",
  },
  senderName: { fontSize: 12, fontWeight: 700, marginBottom: 4 },
  senderLine: { fontSize: 10, marginBottom: 2 },

  bodyWrap: {
    position: "absolute",
    left: 40,
    right: 47,
    top: 155,
    bottom: 148,
  },

  clientRow: { flexDirection: "row", marginBottom: 14 },
  clientLeft: { flex: 1 },
  clientRight: { width: 190, alignItems: "flex-end" },

  sectionLabel: { fontSize: 10, fontWeight: 700, marginBottom: 6, letterSpacing: 0.6 },
  clientNameText: { fontSize: 12, fontWeight: 700, color: "#0A2540", marginBottom: 4 },
  clientLine: { fontSize: 10, color: "#0A2540", marginBottom: 2, lineHeight: 1.4 },

  metaRow: { flexDirection: "row", justifyContent: "flex-end" },
  metaCol: { alignItems: "flex-end" },
  metaCell: { fontSize: 9, color: "#0A2540", lineHeight: 1.8, textAlign: "right" },
  metaTitle: { fontSize: 10, fontWeight: 700, textAlign: "right", marginBottom: 4, color: "#0A2540" },

  table: {
    borderWidth: 1,
    borderColor: "#DFE4EA",
    borderRadius: 3,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F6F8FC",
    borderBottomWidth: 1,
    borderBottomColor: "#DFE4EA",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  thText: {
    fontSize: 9,
    fontWeight: 700,
    color: "#0A2540",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  td: { fontSize: 9, color: "#0A2540" },

  colDesc: { flex: 1, paddingRight: 8 },
  colCant: { width: 62, textAlign: "center" },
  colPrice: { width: 82, textAlign: "right", paddingRight: 4 },
  colIva: { width: 52, textAlign: "center" },
  colTotal: { width: 82, textAlign: "right" },
  colPriceCell: { width: 82, textAlign: "right", paddingRight: 4 },
  colTotalCell: { width: 82, textAlign: "right" },
  colCantCell: { width: 62, textAlign: "center" },
  colIvaCell: { width: 52, textAlign: "center" },

  totalsBlock: { alignItems: "flex-end", marginTop: 2 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 240,
    paddingVertical: 5,
    paddingHorizontal: 14,
    backgroundColor: "#F6F8FC",
    borderRadius: 3,
    marginBottom: 3,
  },
  totalLabel: { fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 },
  totalAmount: { fontSize: 10 },
  totalIva: { color: "#7252FF" },
  totalRowFinal: { backgroundColor: "#3B1E8A" },
  totalLabelFinal: { color: "#FFFFFF" },
  totalAmountFinal: { color: "#FFFFFF", fontSize: 11, fontWeight: 700 },

  footerWrap: {
    position: "absolute",
    left: 26,
    right: 34,
    top: 710,
    height: 105,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  footerCols: { flexDirection: "row" },
  footerLeft: { flex: 1, paddingRight: 20 },
  footerRight: { width: 200, alignItems: "flex-end" },

  bankName: { fontSize: 11, fontWeight: 700, marginBottom: 4 },
  bankLine: { fontSize: 10, marginBottom: 3, lineHeight: 1.3 },
  bankBold: { fontWeight: 700 },
  bankNormal: { fontWeight: 400 },

  contactTitle: { fontSize: 11, fontWeight: 700, color: "#5D6481", marginBottom: 3 },
  contactLine: { fontSize: 10, color: "#5D6481", marginBottom: 2, textAlign: "right" },

  termsWrap: {
    position: "absolute",
    left: 26,
    top: 778,
    right: 34,
  },
  termsTitle: { fontSize: 9, fontWeight: 700, marginBottom: 4 },
  termsText: { fontSize: 8, color: "#5D6481", lineHeight: 1.4, width: 340 },

  refText: {
    position: "absolute",
    right: 34,
    top: 810,
    fontSize: 9,
    fontWeight: 700,
    textAlign: "right",
  },
  refNormal: { fontWeight: 400 },

  notes: {
    position: "absolute",
    left: 40,
    bottom: 118,
    fontSize: 8,
    color: "#5B6B7B",
    lineHeight: 1.4,
    width: 300,
  },
});

function formatPrice(n: number): string {
  const f = n.toFixed(2).replace(".", ",");
  const [int, dec] = f.split(",");
  const sep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sep},${dec} €`;
}

function formatDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase()
    .replace(/\./g, "");
}

type PresupuestoPDFProps = {
  number: string;
  clientName: string;
  clientNif?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  introduction: string;
  items: Array<{ title: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  createdAt: string;
  logoImage?: string;
};

export function PresupuestoPDF(props: PresupuestoPDFProps) {
  const labels = [
    { label: "NÚMERO DE FACTURA:", value: props.number },
    { label: "FECHA DE FACTURA:", value: formatDate(props.createdAt) },
    { label: "FECHA DE PAGO:", value: formatDate(props.createdAt) },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ position: "absolute", left: 26, top: 0, width: 1, height: PAGE_H, backgroundColor: "#E5E5E5" }} />
        <View style={{ position: "absolute", left: 561, top: 0, width: 1, height: PAGE_H, backgroundColor: "#E5E5E5" }} />
        <View style={{ position: "absolute", left: 0, top: 17, width: PAGE_W, height: 1, backgroundColor: "#E5E5E5" }} />
        <View style={{ position: "absolute", left: 0, top: 140, width: PAGE_W, height: 1, backgroundColor: "#E5E5E5" }} />
        <View style={{ position: "absolute", left: 0, top: 699, width: PAGE_W, height: 1, backgroundColor: "#E5E5E5" }} />
        <View style={{ position: "absolute", left: 0, top: 830, width: PAGE_W, height: 1, backgroundColor: "#E5E5E5" }} />

        {props.logoImage ? (
          <View style={styles.logoBox}>
            <Image src={props.logoImage} style={styles.logoImg} />
          </View>
        ) : null}

        <Text style={styles.invoiceTitle}>
          <Text style={styles.titleLight}>{props.number}</Text>
          <Text style={styles.titleSep}> | </Text>
          <Text style={styles.titleBold}>PRESUPUESTO</Text>
        </Text>

        <View style={styles.senderBlock}>
          <Text style={styles.senderName}>Adimen Intelligence Services S.L.</Text>
          <Text style={styles.senderLine}>NIF: B88787171</Text>
          <Text style={styles.senderLine}>Kalea/Lorem Ipsum dolor</Text>
          <Text style={styles.senderLine}>adimenai.tech@gmail.com | +34 650 60 90 28</Text>
        </View>

        <View style={styles.bodyWrap}>
          <View style={styles.clientRow}>
            <View style={styles.clientLeft}>
              <Text style={styles.sectionLabel}>EMPRESA A LA QUE SE FACTURA</Text>
              <Text style={styles.clientNameText}>{props.clientName}</Text>
              {props.clientAddress ? <Text style={styles.clientLine}>{props.clientAddress}</Text> : null}
              {props.clientNif ? <Text style={styles.clientLine}>CIF / NIF: {props.clientNif}</Text> : null}
              {props.clientEmail ? <Text style={styles.clientLine}>{props.clientEmail}</Text> : null}
            </View>
            <View style={styles.clientRight}>
              <Text style={styles.metaTitle}>Fecha de factura</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  {labels.map((l, i) => (
                    <Text key={i} style={styles.metaCell}>{l.label}</Text>
                  ))}
                </View>
                <View style={[styles.metaCol, { marginLeft: 6 }]}>
                  {labels.map((l, i) => (
                    <Text key={i} style={styles.metaCell}>{l.value}</Text>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, styles.colDesc]}>Descripción</Text>
              <Text style={[styles.thText, styles.colCant]}>Cantidad</Text>
              <Text style={[styles.thText, styles.colPrice]}>Precio</Text>
              <Text style={[styles.thText, styles.colIva]}>IVA</Text>
              <Text style={[styles.thText, styles.colTotal]}>Total</Text>
            </View>
            {props.items.map((item, index) => {
              const isLast = index === props.items.length - 1;
              return (
                <View key={index} style={isLast ? [styles.tr, { borderBottomWidth: 0 }] : styles.tr}>
                  <Text style={[styles.td, styles.colDesc]}>{item.title}</Text>
                  <Text style={[styles.td, styles.colCantCell]}>{String(item.quantity).padStart(2, "0")}</Text>
                  <Text style={[styles.td, styles.colPriceCell]}>{formatPrice(item.unitPrice)}</Text>
                  <Text style={[styles.td, styles.colIvaCell]}>{props.taxRate}%</Text>
                  <Text style={[styles.td, styles.colTotalCell]}>{formatPrice(item.total)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalAmount}>{formatPrice(props.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA ({props.taxRate}%)</Text>
              <Text style={[styles.totalAmount, styles.totalIva]}>{formatPrice(props.taxAmount)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={[styles.totalLabel, styles.totalLabelFinal]}>Total presupuesto</Text>
              <Text style={[styles.totalAmount, styles.totalAmountFinal]}>{formatPrice(props.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerWrap}>
          <Text style={styles.footerTitle}>INSTRUCCIONES DE PAGO</Text>
          <View style={styles.footerCols}>
            <View style={styles.footerLeft}>
              <Text style={styles.bankName}>Adimen Intelligence Services S.L.</Text>
              <Text style={styles.bankLine}>
                <Text style={styles.bankBold}>Número de cuenta: </Text>
                <Text style={styles.bankNormal}>ES 123 456 789</Text>
              </Text>
              <Text style={styles.bankLine}>
                <Text style={styles.bankBold}>SWIFT/BIC: </Text>
                <Text style={styles.bankNormal}>NTSBDEB1XXX</Text>
              </Text>
              <Text style={styles.bankLine}>
                <Text style={styles.bankBold}>Nombre del banco: </Text>
                <Text style={styles.bankNormal}>N26</Text>
              </Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.contactTitle}>Adimen AI</Text>
              <Text style={styles.contactLine}>www.adimenai.com</Text>
              <Text style={styles.contactLine}>adimenai.tech@gmail.com</Text>
              <Text style={styles.contactLine}>+34 650 60 90 28</Text>
            </View>
          </View>
        </View>

        <View style={styles.termsWrap}>
          <Text style={styles.termsTitle}>Términos y condiciones</Text>
          <Text style={styles.termsText}>
            Los términos de pago y las tarifas se establecerán en el contrato o acuerdo previo al inicio del proyecto.
            Se requerirá un depósito inicial antes de comenzar cualquier trabajo de diseño. Nos reservamos el derecho
            de suspender o detener el trabajo en caso de impago.
          </Text>
        </View>

        <Text style={styles.refText}>
          Por favor, utilice <Text style={styles.refNormal}>{props.number}</Text> como número de referencia.
        </Text>

        {props.notes ? <Text style={styles.notes}>{props.notes}</Text> : null}
      </Page>
    </Document>
  );
}
