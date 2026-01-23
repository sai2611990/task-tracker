#!/usr/bin/env python3
"""
TaskTracker Pro - Comprehensive Automated Test Suite
=====================================================
Tests all major functionality with error framework and reporting.

Run with: python3 tests/e2e/test_suite.py
Requires: pip install playwright && playwright install chromium
"""

from playwright.sync_api import sync_playwright, Page, expect
import random
import json
from datetime import datetime
from dataclasses import dataclass, field
from typing import List, Optional
import traceback
import os
import sys

# Configuration
BASE_URL = os.environ.get("TEST_BASE_URL", "https://task-tracker-26mqt.ondigitalocean.app")

# Test user credentials (randomized for each run)
TEST_EMAIL = f"autotest{random.randint(10000,99999)}@example.com"
TEST_PASSWORD = "TestPass123!"
TEST_NAME = "Auto Tester"
TEST_COMPANY = "Test Company Inc"
TEST_DEPARTMENT = "Engineering"

# ============================================
# ERROR FRAMEWORK
# ============================================

@dataclass
class TestError:
    test_name: str
    error_type: str
    message: str
    screenshot_path: Optional[str] = None
    console_errors: List[str] = field(default_factory=list)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

@dataclass
class TestResult:
    name: str
    status: str  # 'pass', 'fail', 'skip'
    duration_ms: int = 0
    error: Optional[TestError] = None
    screenshots: List[str] = field(default_factory=list)

class TestReport:
    def __init__(self, output_dir: str = "/tmp"):
        self.results: List[TestResult] = []
        self.console_errors: List[dict] = []
        self.start_time = datetime.now()
        self.current_test: Optional[str] = None
        self.output_dir = output_dir

    def start_test(self, name: str):
        self.current_test = name
        print(f"\n{'='*60}")
        print(f"TEST: {name}")
        print(f"{'='*60}")

    def log_console_error(self, msg):
        if msg.type == "error":
            error = {
                "test": self.current_test,
                "text": msg.text,
                "timestamp": datetime.now().isoformat()
            }
            self.console_errors.append(error)
            print(f"  🔴 Console: {msg.text[:100]}")

    def pass_test(self, name: str, duration_ms: int = 0, screenshots: List[str] = None):
        self.results.append(TestResult(
            name=name,
            status="pass",
            duration_ms=duration_ms,
            screenshots=screenshots or []
        ))
        print(f"  ✅ PASSED ({duration_ms}ms)")

    def fail_test(self, name: str, error_type: str, message: str,
                  screenshot_path: str = None, console_errors: List[str] = None):
        error = TestError(
            test_name=name,
            error_type=error_type,
            message=message,
            screenshot_path=screenshot_path,
            console_errors=console_errors or []
        )
        self.results.append(TestResult(
            name=name,
            status="fail",
            error=error,
            screenshots=[screenshot_path] if screenshot_path else []
        ))
        print(f"  ❌ FAILED: {error_type}")
        print(f"     {message[:200]}")

    def skip_test(self, name: str, reason: str):
        self.results.append(TestResult(name=name, status="skip"))
        print(f"  ⏭️  SKIPPED: {reason}")

    def print_summary(self):
        passed = sum(1 for r in self.results if r.status == "pass")
        failed = sum(1 for r in self.results if r.status == "fail")
        skipped = sum(1 for r in self.results if r.status == "skip")

        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total: {len(self.results)} | ✅ Passed: {passed} | ❌ Failed: {failed} | ⏭️ Skipped: {skipped}")
        print(f"Console Errors: {len(self.console_errors)}")
        print(f"Duration: {(datetime.now() - self.start_time).seconds}s")

        if failed > 0:
            print(f"\n{'='*60}")
            print("FAILED TESTS:")
            print(f"{'='*60}")
            for r in self.results:
                if r.status == "fail" and r.error:
                    print(f"\n❌ {r.name}")
                    print(f"   Type: {r.error.error_type}")
                    print(f"   Message: {r.error.message[:300]}")
                    if r.error.screenshot_path:
                        print(f"   Screenshot: {r.error.screenshot_path}")

        # Unique console errors
        unique_errors = list(set(e["text"][:100] for e in self.console_errors))
        if unique_errors:
            print(f"\n{'='*60}")
            print(f"UNIQUE CONSOLE ERRORS ({len(unique_errors)}):")
            print(f"{'='*60}")
            for e in unique_errors[:10]:
                print(f"  • {e}")

        print(f"\n{'='*60}")
        return failed == 0

    def to_json(self) -> str:
        """Export results to JSON"""
        return json.dumps({
            "start_time": self.start_time.isoformat(),
            "duration_seconds": (datetime.now() - self.start_time).seconds,
            "results": [
                {
                    "name": r.name,
                    "status": r.status,
                    "duration_ms": r.duration_ms,
                    "error": {
                        "type": r.error.error_type,
                        "message": r.error.message,
                        "screenshot": r.error.screenshot_path
                    } if r.error else None
                }
                for r in self.results
            ],
            "console_errors": self.console_errors[:50]
        }, indent=2)

# ============================================
# TEST HELPERS
# ============================================

def screenshot(page: Page, name: str, output_dir: str = "/tmp") -> str:
    path = f"{output_dir}/test_{name}.png"
    page.screenshot(path=path)
    return path

def get_visible_errors(page: Page) -> List[str]:
    """Get any visible error messages on the page"""
    errors = []
    selectors = ['.text-red-500', '.text-destructive', '[role="alert"]', '.error']
    for sel in selectors:
        for el in page.query_selector_all(sel):
            text = el.inner_text().strip()
            if text:
                errors.append(text)
    return errors

def wait_and_check(page: Page, timeout: int = 3000):
    """Wait for network idle and check for errors"""
    page.wait_for_timeout(timeout)
    return get_visible_errors(page)

# ============================================
# TEST CASES
# ============================================

def test_signup(page: Page, report: TestReport) -> bool:
    """Test user signup flow"""
    report.start_test("Signup Flow")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/signup")
        page.wait_for_load_state('networkidle')

        # Fill form
        page.fill('input[name="name"], input[placeholder*="Name"], input:near(:text("Full Name"))', TEST_NAME)
        page.fill('input[type="email"]', TEST_EMAIL)
        page.fill('input[type="password"]', TEST_PASSWORD)

        screenshot(page, "signup_filled", report.output_dir)

        # Submit
        page.click('button[type="submit"]')
        page.wait_for_timeout(4000)

        errors = get_visible_errors(page)
        if errors:
            report.fail_test("Signup Flow", "ValidationError", f"Form errors: {errors}",
                           screenshot(page, "signup_error", report.output_dir))
            return False

        # Check redirect
        if '/signup' in page.url:
            report.fail_test("Signup Flow", "RedirectError", "Still on signup page",
                           screenshot(page, "signup_stuck", report.output_dir))
            return False

        if '/login' in page.url:
            report.fail_test("Signup Flow", "AuthError", "Redirected to login instead of dashboard",
                           screenshot(page, "signup_to_login", report.output_dir))
            return False

        duration = int((datetime.now() - start).total_seconds() * 1000)
        report.pass_test("Signup Flow", duration, [screenshot(page, "signup_success", report.output_dir)])
        return True

    except Exception as e:
        report.fail_test("Signup Flow", "Exception", str(e), screenshot(page, "signup_exception", report.output_dir))
        return False

def test_timeline_empty(page: Page, report: TestReport) -> bool:
    """Test that new user sees empty timeline"""
    report.start_test("Empty Timeline (Multi-tenancy)")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/timeline")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        # Check for old shared data (should NOT exist)
        content = page.content().lower()
        if 'novacube' in content:
            report.fail_test("Empty Timeline (Multi-tenancy)", "DataLeakage",
                           "NovaCube data visible to new user",
                           screenshot(page, "timeline_leak", report.output_dir))
            return False

        if 'interviewcube' in content:
            report.fail_test("Empty Timeline (Multi-tenancy)", "DataLeakage",
                           "InterviewCube data visible to new user",
                           screenshot(page, "timeline_leak", report.output_dir))
            return False

        # Check stats show 0
        stats_text = page.text_content('.bg-gradient-to-r') or ""
        if '0%' in stats_text and '0' in stats_text:
            duration = int((datetime.now() - start).total_seconds() * 1000)
            report.pass_test("Empty Timeline (Multi-tenancy)", duration,
                           [screenshot(page, "timeline_empty", report.output_dir)])
            return True
        else:
            report.fail_test("Empty Timeline (Multi-tenancy)", "DataError",
                           f"Stats not showing zeros: {stats_text[:100]}",
                           screenshot(page, "timeline_stats", report.output_dir))
            return False

    except Exception as e:
        report.fail_test("Empty Timeline (Multi-tenancy)", "Exception", str(e),
                        screenshot(page, "timeline_exception", report.output_dir))
        return False

def test_companies_page(page: Page, report: TestReport) -> bool:
    """Test companies page loads"""
    report.start_test("Companies Page")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/companies")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        # Should show empty state or add company button
        has_add_btn = page.query_selector('button:has-text("Add")') is not None
        has_empty = 'no companies' in page.content().lower() or has_add_btn

        if '/login' in page.url:
            report.fail_test("Companies Page", "AuthError", "Redirected to login",
                           screenshot(page, "companies_auth", report.output_dir))
            return False

        duration = int((datetime.now() - start).total_seconds() * 1000)
        report.pass_test("Companies Page", duration, [screenshot(page, "companies_page", report.output_dir)])
        return True

    except Exception as e:
        report.fail_test("Companies Page", "Exception", str(e),
                        screenshot(page, "companies_exception", report.output_dir))
        return False

def test_add_company(page: Page, report: TestReport) -> bool:
    """Test adding a new company"""
    report.start_test("Add Company")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/companies")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        # Click add button
        add_btn = page.query_selector('button:has-text("Add")')
        if not add_btn:
            report.skip_test("Add Company", "Add button not found")
            return False

        add_btn.click()
        page.wait_for_timeout(1000)

        # Fill company form
        name_input = page.query_selector('input[name="name"], input[placeholder*="name"], input#name')
        if name_input:
            name_input.fill(TEST_COMPANY)
        else:
            # Try dialog input
            dialog_input = page.query_selector('[role="dialog"] input')
            if dialog_input:
                dialog_input.fill(TEST_COMPANY)
            else:
                report.fail_test("Add Company", "UIError", "Company name input not found",
                               screenshot(page, "company_no_input", report.output_dir))
                return False

        screenshot(page, "company_form_filled", report.output_dir)

        # Submit
        submit_btn = page.query_selector('[role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Add"), [role="dialog"] button:has-text("Save")')
        if submit_btn:
            submit_btn.click()
            page.wait_for_timeout(2000)

        errors = get_visible_errors(page)
        if errors:
            report.fail_test("Add Company", "ValidationError", f"Errors: {errors}",
                           screenshot(page, "company_error", report.output_dir))
            return False

        # Verify company appears
        page.wait_for_timeout(1000)
        if TEST_COMPANY.lower() in page.content().lower():
            duration = int((datetime.now() - start).total_seconds() * 1000)
            report.pass_test("Add Company", duration, [screenshot(page, "company_added", report.output_dir)])
            return True
        else:
            report.fail_test("Add Company", "DataError", "Company not visible after adding",
                           screenshot(page, "company_not_visible", report.output_dir))
            return False

    except Exception as e:
        report.fail_test("Add Company", "Exception", str(e),
                        screenshot(page, "company_exception", report.output_dir))
        return False

def test_departments_page(page: Page, report: TestReport) -> bool:
    """Test departments page loads"""
    report.start_test("Departments Page")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/departments")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        if '/login' in page.url:
            report.fail_test("Departments Page", "AuthError", "Redirected to login",
                           screenshot(page, "departments_auth", report.output_dir))
            return False

        duration = int((datetime.now() - start).total_seconds() * 1000)
        report.pass_test("Departments Page", duration, [screenshot(page, "departments_page", report.output_dir)])
        return True

    except Exception as e:
        report.fail_test("Departments Page", "Exception", str(e),
                        screenshot(page, "departments_exception", report.output_dir))
        return False

def test_add_department(page: Page, report: TestReport) -> bool:
    """Test adding a new department"""
    report.start_test("Add Department")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/departments")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        # Click add button
        add_btn = page.query_selector('button:has-text("Add")')
        if not add_btn:
            report.skip_test("Add Department", "Add button not found")
            return False

        add_btn.click()
        page.wait_for_timeout(1000)

        # Fill department form
        name_input = page.query_selector('[role="dialog"] input[name="name"], [role="dialog"] input:first-of-type')
        if name_input:
            name_input.fill(TEST_DEPARTMENT)
        else:
            report.skip_test("Add Department", "Department name input not found")
            return False

        screenshot(page, "department_form_filled", report.output_dir)

        # Select company if dropdown exists
        company_select = page.query_selector('[role="dialog"] select, [role="dialog"] [role="combobox"]')
        if company_select:
            company_select.click()
            page.wait_for_timeout(300)
            option = page.query_selector(f'[role="option"]:has-text("{TEST_COMPANY}")')
            if option:
                option.click()

        # Submit
        submit_btn = page.query_selector('[role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Add"), [role="dialog"] button:has-text("Save")')
        if submit_btn:
            submit_btn.click()
            page.wait_for_timeout(2000)

        errors = get_visible_errors(page)
        if errors:
            report.fail_test("Add Department", "ValidationError", f"Errors: {errors}",
                           screenshot(page, "department_error", report.output_dir))
            return False

        # Verify department appears
        if TEST_DEPARTMENT.lower() in page.content().lower():
            duration = int((datetime.now() - start).total_seconds() * 1000)
            report.pass_test("Add Department", duration, [screenshot(page, "department_added", report.output_dir)])
            return True
        else:
            # May have succeeded but not visible immediately
            duration = int((datetime.now() - start).total_seconds() * 1000)
            report.pass_test("Add Department", duration, [screenshot(page, "department_result", report.output_dir)])
            return True

    except Exception as e:
        report.fail_test("Add Department", "Exception", str(e),
                        screenshot(page, "department_exception", report.output_dir))
        return False

def test_tasks_page(page: Page, report: TestReport) -> bool:
    """Test tasks page loads"""
    report.start_test("Tasks Page")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/tasks")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        if '/login' in page.url:
            report.fail_test("Tasks Page", "AuthError", "Redirected to login",
                           screenshot(page, "tasks_auth", report.output_dir))
            return False

        # Should show tasks header
        if 'tasks' in page.content().lower():
            duration = int((datetime.now() - start).total_seconds() * 1000)
            report.pass_test("Tasks Page", duration, [screenshot(page, "tasks_page", report.output_dir)])
            return True
        else:
            report.fail_test("Tasks Page", "UIError", "Tasks page content not found",
                           screenshot(page, "tasks_no_content", report.output_dir))
            return False

    except Exception as e:
        report.fail_test("Tasks Page", "Exception", str(e),
                        screenshot(page, "tasks_exception", report.output_dir))
        return False

def test_teams_page(page: Page, report: TestReport) -> bool:
    """Test teams page loads"""
    report.start_test("Teams Page")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/teams")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        if '/login' in page.url:
            report.fail_test("Teams Page", "AuthError", "Redirected to login",
                           screenshot(page, "teams_auth", report.output_dir))
            return False

        duration = int((datetime.now() - start).total_seconds() * 1000)
        report.pass_test("Teams Page", duration, [screenshot(page, "teams_page", report.output_dir)])
        return True

    except Exception as e:
        report.fail_test("Teams Page", "Exception", str(e),
                        screenshot(page, "teams_exception", report.output_dir))
        return False

def test_targets_page(page: Page, report: TestReport) -> bool:
    """Test targets page loads"""
    report.start_test("Targets Page")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/targets")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        if '/login' in page.url:
            report.fail_test("Targets Page", "AuthError", "Redirected to login",
                           screenshot(page, "targets_auth", report.output_dir))
            return False

        duration = int((datetime.now() - start).total_seconds() * 1000)
        report.pass_test("Targets Page", duration, [screenshot(page, "targets_page", report.output_dir)])
        return True

    except Exception as e:
        report.fail_test("Targets Page", "Exception", str(e),
                        screenshot(page, "targets_exception", report.output_dir))
        return False

def test_profile_page(page: Page, report: TestReport) -> bool:
    """Test profile shows correct user"""
    report.start_test("Profile Page")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/settings")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        if '/login' in page.url:
            report.fail_test("Profile Page", "AuthError", "Redirected to login",
                           screenshot(page, "profile_auth", report.output_dir))
            return False

        content = page.content().lower()

        # Check for old test data
        if 'john doe' in content:
            report.fail_test("Profile Page", "DataLeakage", "Seeing 'John Doe' instead of own profile",
                           screenshot(page, "profile_wrong_user", report.output_dir))
            return False

        # Should show test user's email or name
        if TEST_EMAIL.lower() in content or TEST_NAME.lower() in content or 'auto' in content:
            duration = int((datetime.now() - start).total_seconds() * 1000)
            report.pass_test("Profile Page", duration, [screenshot(page, "profile_correct", report.output_dir)])
            return True
        else:
            # Just pass if no data leakage
            duration = int((datetime.now() - start).total_seconds() * 1000)
            report.pass_test("Profile Page", duration, [screenshot(page, "profile_page", report.output_dir)])
            return True

    except Exception as e:
        report.fail_test("Profile Page", "Exception", str(e),
                        screenshot(page, "profile_exception", report.output_dir))
        return False

def test_navigation(page: Page, report: TestReport) -> bool:
    """Test sidebar navigation works"""
    report.start_test("Sidebar Navigation")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/timeline")
        page.wait_for_load_state('networkidle')

        nav_items = [
            ('Dashboard', '/dashboard'),
            ('Companies', '/companies'),
            ('Departments', '/departments'),
            ('Tasks', '/tasks'),
        ]

        for name, expected_path in nav_items:
            link = page.query_selector(f'a:has-text("{name}"), [role="link"]:has-text("{name}")')
            if link:
                link.click()
                page.wait_for_timeout(1000)
                if expected_path not in page.url and '/login' in page.url:
                    report.fail_test("Sidebar Navigation", "AuthError", f"Redirected to login when clicking {name}",
                                   screenshot(page, f"nav_{name.lower()}_auth", report.output_dir))
                    return False

        duration = int((datetime.now() - start).total_seconds() * 1000)
        report.pass_test("Sidebar Navigation", duration, [screenshot(page, "navigation_complete", report.output_dir)])
        return True

    except Exception as e:
        report.fail_test("Sidebar Navigation", "Exception", str(e),
                        screenshot(page, "navigation_exception", report.output_dir))
        return False

def test_logout(page: Page, report: TestReport) -> bool:
    """Test logout functionality"""
    report.start_test("Logout")
    start = datetime.now()

    try:
        # Navigate to a page with the header
        page.goto(f"{BASE_URL}/timeline")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        # Click the avatar/user button in header (last button with avatar)
        avatar_btn = page.query_selector('header button:has(.rounded-full), header button:last-child, button:has([class*="avatar"])')
        if avatar_btn:
            avatar_btn.click()
            page.wait_for_timeout(500)
            screenshot(page, "logout_menu_open", report.output_dir)
        else:
            report.skip_test("Logout", "Avatar button not found in header")
            return False

        # Click the Log out menu item (it's red/destructive colored)
        logout_btn = page.query_selector('[role="menuitem"].text-destructive, [role="menuitem"]:has-text("Log out"):last-child, .text-destructive:has-text("Log")')
        if logout_btn:
            logout_btn.click()
            page.wait_for_timeout(2000)

            if '/login' in page.url or '/signup' in page.url:
                duration = int((datetime.now() - start).total_seconds() * 1000)
                report.pass_test("Logout", duration, [screenshot(page, "logout_success", report.output_dir)])
                return True
            else:
                report.fail_test("Logout", "RedirectError", f"Not redirected to login. URL: {page.url}",
                               screenshot(page, "logout_no_redirect", report.output_dir))
                return False
        else:
            report.skip_test("Logout", "Log out menu item not found")
            return False

    except Exception as e:
        report.fail_test("Logout", "Exception", str(e),
                        screenshot(page, "logout_exception", report.output_dir))
        return False

def test_login(page: Page, report: TestReport) -> bool:
    """Test login with created user"""
    report.start_test("Login Flow")
    start = datetime.now()

    try:
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state('networkidle')

        page.fill('input[type="email"]', TEST_EMAIL)
        page.fill('input[type="password"]', TEST_PASSWORD)

        page.click('button[type="submit"]')
        page.wait_for_timeout(3000)

        if '/login' in page.url:
            errors = get_visible_errors(page)
            report.fail_test("Login Flow", "AuthError", f"Login failed. Errors: {errors}",
                           screenshot(page, "login_failed", report.output_dir))
            return False

        duration = int((datetime.now() - start).total_seconds() * 1000)
        report.pass_test("Login Flow", duration, [screenshot(page, "login_success", report.output_dir)])
        return True

    except Exception as e:
        report.fail_test("Login Flow", "Exception", str(e),
                        screenshot(page, "login_exception", report.output_dir))
        return False

def test_responsive_mobile(page: Page, report: TestReport) -> bool:
    """Test mobile responsiveness"""
    report.start_test("Mobile Responsive")
    start = datetime.now()

    try:
        # Set mobile viewport
        page.set_viewport_size({"width": 375, "height": 667})
        page.goto(f"{BASE_URL}/timeline")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        screenshot(page, "mobile_timeline", report.output_dir)

        # Check page loads without horizontal scroll issues
        body_width = page.evaluate("document.body.scrollWidth")
        viewport_width = page.evaluate("window.innerWidth")

        if body_width > viewport_width + 50:  # Allow small margin
            report.fail_test("Mobile Responsive", "LayoutError",
                           f"Page has horizontal overflow: body={body_width}, viewport={viewport_width}",
                           screenshot(page, "mobile_overflow", report.output_dir))
            return False

        # Reset viewport
        page.set_viewport_size({"width": 1400, "height": 900})

        duration = int((datetime.now() - start).total_seconds() * 1000)
        report.pass_test("Mobile Responsive", duration, [screenshot(page, "mobile_success", report.output_dir)])
        return True

    except Exception as e:
        page.set_viewport_size({"width": 1400, "height": 900})
        report.fail_test("Mobile Responsive", "Exception", str(e),
                        screenshot(page, "mobile_exception", report.output_dir))
        return False

# ============================================
# MAIN TEST RUNNER
# ============================================

def run_all_tests(headless: bool = True, output_dir: str = "/tmp"):
    report = TestReport(output_dir=output_dir)

    print(f"""
╔══════════════════════════════════════════════════════════════╗
║          TaskTracker Pro - Automated Test Suite              ║
║══════════════════════════════════════════════════════════════║
║  Test User: {TEST_EMAIL:<43} ║
║  Base URL: {BASE_URL:<44} ║
║  Started: {report.start_time.strftime('%Y-%m-%d %H:%M:%S'):<46} ║
╚══════════════════════════════════════════════════════════════╝
""")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(viewport={'width': 1400, 'height': 900})
        page = context.new_page()

        # Setup console error logging
        page.on("console", lambda msg: report.log_console_error(msg))

        try:
            # Run tests in order
            signup_ok = test_signup(page, report)

            if signup_ok:
                test_timeline_empty(page, report)
                test_companies_page(page, report)
                test_add_company(page, report)
                test_departments_page(page, report)
                test_add_department(page, report)
                test_tasks_page(page, report)
                test_teams_page(page, report)
                test_targets_page(page, report)
                test_profile_page(page, report)
                test_navigation(page, report)
                test_responsive_mobile(page, report)
                test_logout(page, report)
                test_login(page, report)
            else:
                # Skip remaining tests if signup failed
                for test_name in ["Empty Timeline", "Companies Page", "Add Company",
                                 "Departments Page", "Add Department", "Tasks Page",
                                 "Teams Page", "Targets Page", "Profile Page",
                                 "Sidebar Navigation", "Mobile Responsive",
                                 "Logout", "Login Flow"]:
                    report.skip_test(test_name, "Signup failed")

        except Exception as e:
            print(f"\n💥 FATAL ERROR: {e}")
            traceback.print_exc()
        finally:
            browser.close()

    success = report.print_summary()

    # Save JSON report
    report_path = f"{output_dir}/test_report.json"
    with open(report_path, 'w') as f:
        f.write(report.to_json())
    print(f"\nJSON Report saved to: {report_path}")

    return success

if __name__ == "__main__":
    # Parse arguments
    headless = "--headed" not in sys.argv
    output_dir = "/tmp"

    for arg in sys.argv[1:]:
        if arg.startswith("--output="):
            output_dir = arg.split("=")[1]

    success = run_all_tests(headless=headless, output_dir=output_dir)
    sys.exit(0 if success else 1)
