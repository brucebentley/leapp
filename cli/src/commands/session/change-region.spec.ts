import { jest, describe, test, expect } from "@jest/globals";
import ChangeSessionRegion from "./change-region";

describe("ChangeRegion", () => {
  const getTestCommand = (leappCliService: any = null): ChangeSessionRegion => {
    const command = new ChangeSessionRegion([], {} as any);
    (command as any).leappCliService = leappCliService;
    return command;
  };

  test("selectSession", async () => {
    const session1 = { sessionName: "sessionName" };
    const leappCliService: any = {
      repository: {
        getSessions: () => [session1],
      },
      inquirer: {
        prompt: async (params: any) => {
          expect(params).toEqual([
            {
              name: "selectedSession",
              message: "select a session",
              type: "list",
              choices: [{ name: session1.sessionName, value: session1 }],
            },
          ]);
          return { selectedSession: "selectedSession" };
        },
      },
    };

    const command = getTestCommand(leappCliService);
    const selectedSession = await command.selectSession();
    expect(selectedSession).toBe("selectedSession");
  });

  test("selectRegion", async () => {
    const regionFieldChoice = { fieldName: "regionName2", fieldValue: "regionName3" };
    const leappCliService: any = {
      cloudProviderService: {
        availableRegions: jest.fn(() => [regionFieldChoice]),
      },
      inquirer: {
        prompt: async (params: any) => {
          expect(params).toEqual([
            {
              name: "selectedRegion",
              message: "current region is regionName1, select a new region",
              type: "list",
              choices: [{ name: regionFieldChoice.fieldName, value: regionFieldChoice.fieldValue }],
            },
          ]);
          return { selectedRegion: "selectedRegion" };
        },
      },
    };

    const command = getTestCommand(leappCliService);

    const session = { type: "type", region: "regionName1" } as any;
    const selectedRegion = await command.selectRegion(session);

    expect(selectedRegion).toBe("selectedRegion");
    expect(leappCliService.cloudProviderService.availableRegions).toHaveBeenCalledWith(session.type);
  });

  test("changeSessionRegion", async () => {
    const session = {} as any;
    const newRegion = {} as any;

    const leappCliService: any = {
      regionsService: {
        changeRegion: jest.fn(),
      },
    };

    const command = getTestCommand(leappCliService);
    command.log = jest.fn();

    await command.changeSessionRegion(session, newRegion);
    expect(leappCliService.regionsService.changeRegion).toHaveBeenCalledWith(session, newRegion);
    expect(command.log).toHaveBeenCalledWith("session region changed");
  });

  const runCommand = async (errorToThrow: any, expectedErrorMessage: string) => {
    const session = "session";
    const region = "region";
    const command = getTestCommand();
    command.selectSession = jest.fn(async (): Promise<any> => session);
    command.selectRegion = jest.fn(async (): Promise<any> => region);
    command.changeSessionRegion = jest.fn(async (): Promise<void> => {
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

    expect(command.selectSession).toHaveBeenCalled();
    expect(command.selectRegion).toHaveBeenCalledWith(session);
    expect(command.changeSessionRegion).toHaveBeenCalledWith(session, region);
    if (errorToThrow) {
      expect(occurredError).toEqual(new Error(expectedErrorMessage));
    }
  };

  test("run", async () => {
    await runCommand(undefined, "");
  });

  test("run - changeSessionRegion throws exception", async () => {
    await runCommand(new Error("errorMessage"), "errorMessage");
  });

  test("run - changeSessionRegion throws undefined object", async () => {
    await runCommand({ hello: "randomObj" }, "Unknown error: [object Object]");
  });
});