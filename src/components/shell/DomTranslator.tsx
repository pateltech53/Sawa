"use client";

// While the app is in Arabic, swap known English UI strings for Arabic in the rendered
// page: text nodes, placeholders, aria-labels and titles. It keeps the English so the
// page restores exactly when the language goes back to English. React keeps working:
// when it re-renders a string, the observer translates the new text again.
import { useEffect } from "react";
import { toArabic } from "@/lib/tr";
import { useStore } from "@/lib/store";

const ATTRS = ["placeholder", "aria-label", "title"] as const;
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);

export function DomTranslator() {
  const { state } = useStore();
  const ar = state.lang === "ar";

  useEffect(() => {
    if (!ar) return;
    const textOrig = new Map<Text, string>();
    const attrOrig = new Map<Element, Record<string, string>>();
    let applying = false;

    const doText = (n: Text) => {
      const p = n.parentElement;
      if (!p || SKIP.has(p.tagName) || p.closest("[data-no-tr],[contenteditable]")) return;
      const v = n.nodeValue ?? "";
      const out = toArabic(v);
      if (out == null) { textOrig.delete(n); return; }
      textOrig.set(n, v);
      const lead = v.match(/^\s*/)?.[0] ?? "", trail = v.match(/\s*$/)?.[0] ?? "";
      n.nodeValue = lead + out + trail;
    };
    const doEl = (el: Element) => {
      if (el.closest("[data-no-tr]")) return;
      for (const a of ATTRS) {
        const v = el.getAttribute(a);
        if (!v) continue;
        const out = toArabic(v);
        if (out == null) continue;
        const rec = attrOrig.get(el) ?? {};
        rec[a] = v;
        attrOrig.set(el, rec);
        el.setAttribute(a, out);
      }
    };
    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) return doText(root as Text);
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      doEl(root as Element);
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let cur: Node | null = tw.nextNode();
      while (cur) {
        if (cur.nodeType === Node.TEXT_NODE) doText(cur as Text); else doEl(cur as Element);
        cur = tw.nextNode();
      }
    };

    applying = true; walk(document.body); applying = false;
    const mo = new MutationObserver((records) => {
      if (applying) return;
      applying = true;
      for (const r of records) {
        if (r.type === "characterData") doText(r.target as Text);
        else if (r.type === "attributes") doEl(r.target as Element);
        else r.addedNodes.forEach(walk);
      }
      applying = false;
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });

    return () => {
      mo.disconnect();
      textOrig.forEach((v, n) => { if (n.isConnected) n.nodeValue = v; });
      attrOrig.forEach((rec, el) => { for (const [a, v] of Object.entries(rec)) el.setAttribute(a, v); });
    };
  }, [ar]);

  return null;
}
