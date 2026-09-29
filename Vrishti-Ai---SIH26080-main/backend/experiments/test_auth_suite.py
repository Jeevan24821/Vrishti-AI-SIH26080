import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api"

def run_test(name, fn):
    try:
        fn()
        print(f"PASS: {name}")
    except AssertionError as ae:
        print(f"FAIL: {name} -> Assertion failed: {ae}")
    except Exception as e:
        print(f"FAIL: {name} -> Error: {e}")

def post_json(endpoint, payload):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def get_json(endpoint):
    url = f"{BASE_URL}{endpoint}"
    with urllib.request.urlopen(url, timeout=5) as resp:
        return resp.status, json.loads(resp.read().decode())

print("=" * 60)
print("RUNNING AUTHENTICATION VERIFICATION SUITE")
print("=" * 60)

# Test 1 & 5: Valid login with official system account
def test_valid_login():
    status, body = post_json("/auth/login", {
        "email": "dr.poojary@vrishti-ai.org",
        "password": "password123"
    })
    assert status == 200, f"Expected 200, got {status}"
    assert body["status"] == "success"
    assert body["user"]["email"] == "dr.poojary@vrishti-ai.org"
    assert "token" in body
    assert "password" not in body["user"], "Security failure: password exposed in response!"

run_test("Test 5 - Valid Credentials Sign In", test_valid_login)

# Test 6: Same credentials for another default account
def test_same_credentials_second_account():
    status, body = post_json("/auth/login", {
        "email": "meteorologist@vrishti-ai.org",
        "password": "password123"
    })
    assert status == 200, f"Expected 200, got {status}"
    assert body["user"]["role"] == "IMD Meteorological Analyst"

run_test("Test 6 - Unified Multi-Account Credentials", test_same_credentials_second_account)

# Test 7: Invalid password -> 401 Unauthorized
def test_invalid_password():
    status, body = post_json("/auth/login", {
        "email": "dr.poojary@vrishti-ai.org",
        "password": "wrong_password_999"
    })
    assert status == 401, f"Expected 401, got {status}"
    assert "Invalid / wrong password" in body.get("detail", "")

run_test("Test 7 - Invalid Password Error", test_invalid_password)

# Test 8: Empty password -> 400 Bad Request
def test_empty_password():
    status, body = post_json("/auth/login", {
        "email": "dr.poojary@vrishti-ai.org",
        "password": ""
    })
    assert status == 400, f"Expected 400, got {status}"
    assert "Please enter both email and password" in body.get("detail", "")

run_test("Test 8 - Empty Password Validation", test_empty_password)

# Test 8b: Empty email -> 400 Bad Request
def test_empty_email():
    status, body = post_json("/auth/login", {
        "email": "   ",
        "password": "password123"
    })
    assert status == 400, f"Expected 400, got {status}"

run_test("Test 8b - Empty Email Validation", test_empty_email)

# Test 9: Public accounts endpoint must never expose passwords
def test_security_accounts_listing():
    status, accounts = get_json("/auth/accounts")
    assert status == 200
    for acc in accounts:
        assert "password" not in acc, f"CRITICAL SECURITY LEAK: password in accounts listing for {acc}"

run_test("Test 9 - Security: No Plaintext Passwords in Public Accounts", test_security_accounts_listing)

# Test 10: Non-existent account -> 404
def test_nonexistent_account():
    status, body = post_json("/auth/login", {
        "email": "nonexistent.officer@imd.gov.in",
        "password": "password123"
    })
    assert status == 404, f"Expected 404, got {status}"
    assert "Account does not exist" in body.get("detail", "")

run_test("Test 10 - Non-existent Account Notification", test_nonexistent_account)
print("=" * 60)
