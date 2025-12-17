import { adminService } from "../../services/admin.service";
import { UserModel } from "../../models/user.model";

jest.mock("../../../src/models/user.model");

describe("adminService", () => {

  // getAllUsers()
  test("getAllUsers , success", async () => {
    (UserModel.find as jest.Mock).mockReturnValue({
      skip: () => ({
        limit: () => ({
          select: () => ({
            sort: () => Promise.resolve([{ email: "a@test.com" }])
          })
        })
      })
    });

    (UserModel.countDocuments as jest.Mock).mockResolvedValue(1);

    const result = await adminService.getAllUsers();

    expect(result.items.length).toBe(1);
    expect(result.total).toBe(1);
  });

  // infoUser()
  test("infoUser , success", async () => {
    (UserModel.findById as jest.Mock).mockReturnValue({
      select: () => Promise.resolve({ email: "a@test.com" })
    });

    const result = await adminService.infoUser("1");
    expect(result.email).toBe("a@test.com");
  });

  test("infoUser , USER_NOT_FOUND", async () => {
    (UserModel.findById as jest.Mock).mockReturnValue({
      select: () => Promise.resolve(null)
    });

    await expect(adminService.infoUser("x"))
      .rejects.toMatchObject({ code: "USER_NOT_FOUND" });
  });

  // updateUser()
  test("updateUser , success", async () => {
    (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      select: () => Promise.resolve({ firstName: "Updated" })
    });

    const result = await adminService.updateUser("1", { firstName: "Updated" });
    expect(result.firstName).toBe("Updated");
  });

  test("updateUser ,PASSWORD_UPDATE_FORBIDDEN", async () => {
    await expect(
      adminService.updateUser("1", { password: "123" } as any)
    ).rejects.toMatchObject({ code: "PASSWORD_UPDATE_FORBIDDEN" });
  });

  test("updateUser , USER_NOT_FOUND", async () => {
    (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      select: () => Promise.resolve(null)
    });

    await expect(
      adminService.updateUser("x", { firstName: "Test" })
    ).rejects.toMatchObject({ code: "USER_NOT_FOUND" });
  });

  // deleteUser()
  test("deleteUser , success", async () => {
    (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue({});

    await expect(adminService.deleteUser("1"))
      .resolves.toBeUndefined();
  });

  test("deleteUser ,USER_NOT_FOUND", async () => {
    (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    await expect(adminService.deleteUser("x"))
      .rejects.toMatchObject({ code: "USER_NOT_FOUND" });
  });
});
