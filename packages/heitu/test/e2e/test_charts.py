"""E2E test for Charts pages - verify navigation, rendering, and demos."""
from playwright.sync_api import sync_playwright
import sys

BASE_URL = "http://localhost:8006"
ERRORS = []

def log(msg):
    print(f"  {msg}")

def check(name, condition, detail=""):
    if condition:
        print(f"  ✅ {name}")
    else:
        print(f"  ❌ {name} {detail}")
        ERRORS.append(f"{name} {detail}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})

    # Capture console errors
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    # ── 1. Home page loads ──
    print("\n📋 1. Home page")
    page.goto(f"{BASE_URL}/docs", wait_until="networkidle", timeout=30000)
    page.screenshot(path="/tmp/charts-home.png", full_page=True)
    check("Home page loads", page.title() != "")

    # ── 2. Top nav has Charts menu ──
    print("\n📋 2. Navigation")
    nav_html = page.content()
    has_charts_nav = "Charts" in nav_html
    check("Charts nav exists in page", has_charts_nav)
    page.screenshot(path="/tmp/charts-nav.png")

    # Try to find and click Charts nav link
    charts_link = page.locator('a:has-text("Charts")').first
    if charts_link.count() > 0:
        check("Charts nav link clickable", True)
        charts_link.click()
        page.wait_for_load_state("networkidle")
        page.screenshot(path="/tmp/charts-index.png", full_page=True)
        check("Charts index page loads", "/charts" in page.url.lower() or "charts" in page.content().lower())
    else:
        check("Charts nav link clickable", False, "- link not found")

    # ── 3. Line chart page ──
    print("\n📋 3. Line Chart page")
    page.goto(f"{BASE_URL}/docs/charts/line", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)  # wait for chart rendering
    page.screenshot(path="/tmp/charts-line.png", full_page=True)

    # Check for canvas elements (charts render on canvas)
    canvas_count = page.locator("canvas").count()
    check("Line page has canvas elements", canvas_count > 0, f"- found {canvas_count} canvas")

    # Check page has content
    line_content = page.content()
    check("Line page has title", "LineChart" in line_content or "折线图" in line_content)

    # ── 4. Bar chart page ──
    print("\n📋 4. Bar Chart page")
    page.goto(f"{BASE_URL}/docs/charts/bar", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.screenshot(path="/tmp/charts-bar.png", full_page=True)

    canvas_count = page.locator("canvas").count()
    check("Bar page has canvas elements", canvas_count > 0, f"- found {canvas_count} canvas")

    bar_content = page.content()
    check("Bar page has title", "BarChart" in bar_content or "柱状图" in bar_content)

    # ── 5. Pie chart page ──
    print("\n📋 5. Pie Chart page")
    page.goto(f"{BASE_URL}/docs/charts/pie", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)
    page.screenshot(path="/tmp/charts-pie.png", full_page=True)

    canvas_count = page.locator("canvas").count()
    check("Pie page has canvas elements", canvas_count > 0, f"- found {canvas_count} canvas")

    pie_content = page.content()
    check("Pie page has title", "PieChart" in pie_content or "饼图" in pie_content)

    # ── 6. Check for runtime errors ──
    print("\n📋 6. Console errors")
    serious_errors = [e for e in console_errors if "TypeError" in e or "ReferenceError" in e or "Cannot read" in e]
    check("No serious JS errors", len(serious_errors) == 0, f"- {serious_errors[:3]}")

    browser.close()

# ── Summary ──
print(f"\n{'='*50}")
if ERRORS:
    print(f"❌ {len(ERRORS)} checks failed:")
    for e in ERRORS:
        print(f"   - {e}")
    sys.exit(1)
else:
    print("✅ All checks passed!")
    sys.exit(0)
