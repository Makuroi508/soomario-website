"""Rebuild the Hype Bot record from the master signal list, once a month.

    python scripts/build_hype_record.py path/to/hype_astrabit_signals_master.csv

The master list (id, entry_kst, exit_kst, side, entry_px, exit_px, ret_pct) is every
signal since going live, times in KST (UTC+9). The backtest part (before 6 Nov 2025)
is kept from the current dashboards/hype-trades.json. Writes dashboards/hype-trades.json,
hype-trades.csv and hype-history.json, which the homepage, product page, dashboard and
calculator all read, and prints the figures quoted in fixed text on the site.
"""
import csv
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

DASH = Path(__file__).resolve().parent.parent / "dashboards"
FEE = 0.12                      # % per round trip, fees plus execution
GO_LIVE = "2025-11-06"
KST = timedelta(hours=9)
VENUE = "Bybit HYPEUSDT.P (backtest) · published signals (live)"
STRATEGY = ("Soomario v3 — proprietary momentum swing on HYPE, long and short, one position at a time, "
            "trailing take-profit, 10% hard stop")
SOURCES = {
    "backtest": "TradingView strategy tester, Bybit HYPEUSDT.P.",
    "live": "Every signal as published to subscribers, at the price each signal carried, from the master "
            "signal list (rebuilt once a month). Times converted to UTC. Where our own account's fill is "
            "recorded instead of the signal price, the two are within a few cents.",
}


def gross(t):
    return ((t["exi"] / t["ein"] - 1) if t["side"] == "long" else (t["ein"] - t["exi"]) / t["ein"]) * 100


def utc(kst):
    return (datetime.strptime(kst[:16], "%Y-%m-%d %H:%M") - KST).strftime("%Y-%m-%dT%H:%M")


def stats(trades, agg=True):
    r = [gross(t) - FEE for t in trades]
    idx = 1.0
    for x in r:
        idx *= 1 + x / 100
    pos = sum(x for x in r if x > 0)
    neg = -sum(x for x in r if x < 0)
    s = {"n": len(r), "win": round(sum(x > 0 for x in r) / len(r) * 100, 1), "avg": round(sum(r) / len(r), 4),
         "cum": round((idx - 1) * 100, 2), "pf": round(pos / neg, 2), "best": round(max(r), 2),
         "worst": round(min(r), 2), "from": trades[0]["o"][:10], "to": trades[-1]["c"][:10]}
    if agg:
        s["agg"] = {"wins": sum(x > 0 for x in r), "sum": round(sum(r), 6), "pos": round(pos, 6),
                    "neg": round(neg, 6), "idx": round(idx, 8)}
    return s


def max_dd(trades):
    idx = peak = 1.0
    dd = 0.0
    for t in trades:
        idx *= 1 + (gross(t) - FEE) / 100
        peak = max(peak, idx)
        dd = min(dd, (idx / peak - 1) * 100)
    return dd


def main(master):
    old = json.loads((DASH / "hype-trades.json").read_text(encoding="utf-8"))
    backtest = [t for t in old["trades"] if t["phase"] == "backtest"]
    assert backtest and backtest[-1]["o"] < GO_LIVE, "the backtest part ends before going live"

    live = []
    with open(master, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            t = {"o": utc(row["entry_kst"]), "c": utc(row["exit_kst"]), "side": row["side"].strip().lower(),
                 "ein": float(row["entry_px"]), "exi": float(row["exit_px"]), "phase": "live"}
            assert t["side"] in ("long", "short") and t["c"] >= t["o"] >= GO_LIVE, row
            assert abs(gross(t) - float(row["ret_pct"])) < 0.01, ("prices and ret_pct disagree", row)
            live.append(t)
    live.sort(key=lambda t: t["o"])
    assert all(a["c"] <= b["o"] for a, b in zip(live, live[1:])), "one position at a time"
    trades = backtest + live

    (DASH / "hype-trades.json").write_text(json.dumps({
        "symbol": "HYPE", "venue": VENUE, "commission_pct": FEE, "tz": "UTC", "go_live": GO_LIVE,
        "sources": SOURCES, "from": trades[0]["o"], "to": trades[-1]["c"], "n": len(trades),
        "trades": trades}, separators=(",", ":")), encoding="utf-8")

    with open(DASH / "hype-trades.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["period", "trade", "side", "entry_time_utc", "exit_time_utc", "hours_held", "entry_price",
                    "exit_price", "gross_return_pct", f"net_return_pct_after_{FEE}pct_friction",
                    "cumulative_return_pct_100pct_compounded"])
        idx = 1.0
        for i, t in enumerate(trades, 1):
            g = gross(t)
            idx *= 1 + (g - FEE) / 100
            held = (datetime.fromisoformat(t["c"]) - datetime.fromisoformat(t["o"])).total_seconds() / 3600
            w.writerow([t["phase"], i, t["side"], t["o"].replace("T", " "), t["c"].replace("T", " "),
                        round(held, 2), t["ein"], t["exi"], round(g, 3), round(g - FEE, 3), round((idx - 1) * 100, 2)])

    curve, v = [{"d": trades[0]["o"][:10], "v": 100.0, "phase": "backtest"}], 100.0
    for t in trades:
        v *= 1 + (gross(t) - FEE) / 100
        curve.append({"d": t["c"][:10], "v": round(v, 3), "phase": t["phase"]})
    latest = [dict(t, ret=round(gross(t) - FEE, 2)) for t in trades[-60:]]
    (DASH / "hype-history.json").write_text(json.dumps({
        "symbol": "HYPE", "venue": VENUE, "strategy": STRATEGY, "commission_pct": FEE, "go_live": GO_LIVE,
        "generated": date.today().isoformat(), "sources": SOURCES, "all": stats(trades),
        "backtest": stats(backtest, agg=False), "live": stats(live), "curve": curve, "trades": latest},
        separators=(",", ":")), encoding="utf-8")

    # figures written as fixed text on the site (tools/compare.html, products/hype-bot.html)
    a, L = stats(trades), stats(live)
    bear = [t for t in trades if "2025-09-18" <= t["o"][:10] <= "2026-01-21"]
    bi = 1.0
    for t in bear:
        bi *= 1 + (gross(t) - FEE) / 100
    print(f"live: {L['n']} trades, {L['cum']:+.2f}% after fees, win {L['win']}%, pf {L['pf']}, "
          f"max dd {max_dd(live):.1f}%, last close {live[-1]['c']}")
    print(f"all: {a['n']} trades ({len(backtest)} backtest + {L['n']} live), win {a['win']}%, pf {a['pf']}")
    print(f"HYPE high-to-low window (opened 18 Sep 2025 - 21 Jan 2026): {len(bear)} trades, "
          f"{(bi - 1) * 100:+.1f}%, {sum(gross(t) - FEE > 0 for t in bear) / len(bear) * 100:.0f}% winners, "
          f"{sum(t['phase'] == 'backtest' for t in bear)} backtest + {sum(t['phase'] == 'live' for t in bear)} live")


if __name__ == "__main__":
    main(sys.argv[1])
