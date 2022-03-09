import { jest, describe, test, expect } from "@jest/globals";
import EditIdpUrl from "./edit";

describe("EditIdpUrl", () => {
  const getTestCommand = (leappCliService: any = null, argv: string[] = []): EditIdpUrl => {
    const command = new EditIdpUrl(argv, {} as any);
    (command as any).leappCliService = leappCliService;
    return command;
  };

  test("selectIdpUrl", async () => {
    const idpUrl = { url: "url1" };
    const leappCliService: any = {
      idpUrlsService: {
        getIdpUrls: jest.fn(() => [idpUrl]),
      },
      inquirer: {
        prompt: async (params: any) => {
          expect(params).toEqual([
            {
              name: "selectedIdpUrl",
              message: "select an identity provider URL",
              type: "list",
              choices: [{ name: idpUrl.url, value: idpUrl }],
            },
          ]);
          return { selectedIdpUrl: idpUrl };
        },
      },
    };

    const command = getTestCommand(leappCliService);
    const selectedIdpUrl = await command.selectIdpUrl();

    expect(leappCliService.idpUrlsService.getIdpUrls).toHaveBeenCalled();
    expect(selectedIdpUrl).toBe(idpUrl);
  });

  test("selectIdpUrl, no idp urls", async () => {
    const leappCliService: any = {
      idpUrlsService: {
        getIdpUrls: jest.fn(() => []),
      },
    };

    const command = getTestCommand(leappCliService);
    await expect(command.selectIdpUrl()).rejects.toThrow(new Error("no identity provider URLs available"));
  });

  test("getNewIdpUrl", async () => {
    const leappCliService: any = {
      inquirer: {
        prompt: async (params: any) => {
          expect(params).toMatchObject([
            {
              name: "newIdpUrl",
              message: "choose a new URL",
              type: "input",
            },
          ]);
          expect(params[0].validate("url")).toBe("validationResult");
          return { newIdpUrl: "idpUrl" };
        },
      },
      idpUrlsService: {
        validateIdpUrl: jest.fn(() => "validationResult"),
      },
    };

    const command = getTestCommand(leappCliService);
    const idpUrl = await command.getNewIdpUrl();
    expect(idpUrl).toBe("idpUrl");
    expect(leappCliService.idpUrlsService.validateIdpUrl).toHaveBeenCalledWith("url");
  });

  test("editIdpUrl", async () => {
    const leappCliService: any = {
      idpUrlsService: {
        editIdpUrl: jest.fn(),
      },
    };

    const command = getTestCommand(leappCliService);
    command.log = jest.fn();
    await command.editIdpUrl("idpUrlId", "url");

    expect(leappCliService.idpUrlsService.editIdpUrl).toHaveBeenCalledWith("idpUrlId", "url");
    expect(command.log).toHaveBeenCalledWith("IdP URL edited");
  });

  const runCommand = async (errorToThrow: any, expectedErrorMessage: string) => {
    const idpUrl = { id: "1" };
    const newUrl = "newName";

    const command = getTestCommand();
    command.selectIdpUrl = jest.fn(async (): Promise<any> => idpUrl);
    command.getNewIdpUrl = jest.fn(async (): Promise<any> => newUrl);
    command.editIdpUrl = jest.fn(async () => {
      if (errorToThrow) {
        throw errorToThrow;
      }
    });

    let occurredError;
    try {
      await command.run();
    } catch (error) {
      occurredError = error;
    }

    expect(command.selectIdpUrl).toHaveBeenCalled();
    expect(command.getNewIdpUrl).toHaveBeenCalled();
    expect(command.editIdpUrl).toHaveBeenCalledWith(idpUrl.id, newUrl);
    if (errorToThrow) {
      expect(occurredError).toEqual(new Error(expectedErrorMessage));
    }
  };

  test("run", async () => {
    await runCommand(undefined, "");
  });

  test("run - editIdpUrl throws exception", async () => {
    await runCommand(new Error("errorMessage"), "errorMessage");
  });

  test("run - editIdpUrl throws undefined object", async () => {
    await runCommand({ hello: "randomObj" }, "Unknown error: [object Object]");
  });
});