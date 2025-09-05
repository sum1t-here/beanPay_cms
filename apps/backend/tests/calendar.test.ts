import { describe, it, expect, beforeEach, mock } from "bun:test";
import request from "supertest";

// --- Mock prismaClient ---
type User = { id: string; email: string; password: string } | null;
type Course = { id: string; calendarNotionId: string } | null;
type Purchase = { id: string; userId: string; courseId: string } | null;

const userMock = mock<() => Promise<User>>(() =>
  Promise.resolve({ id: "user-123", email: "test@example.com", password: "secret" })
);

const courseMock = mock<() => Promise<Course>>(() =>
  Promise.resolve({ id: "course-123", calendarNotionId: "calendar-abc" })
);

const purchaseMock = mock<() => Promise<Purchase>>(() =>
  Promise.resolve({ id: "purchase-123", userId: "user-123", courseId: "course-123" })
);

mock.module("db/client", () => {
  return {
    default: {
      user: { findFirst: userMock },
      course: { findFirst: courseMock },
      purchase: { findFirst: purchaseMock },
    },
  };
});

// --- Import app AFTER mocks are set ---
import app from "../index";

// --- Reset mocks before each test ---
beforeEach(() => {
  userMock.mockImplementation(() =>
    Promise.resolve({ id: "user-123", email: "test@example.com", password: "secret" })
  );
  courseMock.mockImplementation(() =>
    Promise.resolve({ id: "course-123", calendarNotionId: "calendar-abc" })
  );
  purchaseMock.mockImplementation(() =>
    Promise.resolve({ id: "purchase-123", userId: "user-123", courseId: "course-123" })
  );
});

// --- Tests ---
describe("GET /calendar/:courseId", () => {
  it("✅ user with a purchase can access calendar", async () => {
    // Step 1: Login to get JWT
    const loginRes = await request(app).post("/signin").send({
      email: "test@example.com",
      password: "secret",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    const token = loginRes.body.token;

    // Step 2: Use JWT to access calendar
    const res = await request(app)
      .get("/calendar/course-123")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: "course-123",
      calendarId: "calendar-abc",
    });
  });

  it("❌ user without purchase cannot access calendar", async () => {
    // Override purchase mock to simulate no purchase
    purchaseMock.mockImplementation(() => Promise.resolve(null));

    const loginRes = await request(app).post("/signin").send({
      email: "test@example.com",
      password: "secret",
    });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    const res = await request(app)
      .get("/calendar/course-123")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(411);
    expect(res.body).toEqual({
      message: "You don't have access to the course",
    });
  });
});
