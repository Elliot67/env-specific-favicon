import { AppDataGlobal } from '~/types/app';

export const defaultSettings: AppDataGlobal = {
  version: '1.0',
  favicon: {
    type: 'global',
    custom: '',
  },
  rules: [],
};

// TODO: Use different global/earth favicon depending on the preferred theme
export const baseFavicons: Record<AppDataGlobal['favicon']['type'], string> = {
  global: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDB6Ii8+PHBhdGggZD0iTTEyIDIyQzYuNDc3IDIyIDIgMTcuNTIzIDIgMTJTNi40NzcgMiAxMiAyczEwIDQuNDc3IDEwIDEwLTQuNDc3IDEwLTEwIDEwem0tMi4yOS0yLjMzM0ExNy45IDE3LjkgMCAwIDEgOC4wMjcgMTNINC4wNjJhOC4wMDggOC4wMDggMCAwIDAgNS42NDggNi42Njd6TTEwLjAzIDEzYy4xNTEgMi40MzkuODQ4IDQuNzMgMS45NyA2Ljc1MkExNS45MDUgMTUuOTA1IDAgMCAwIDEzLjk3IDEzaC0zLjk0em05LjkwOCAwaC0zLjk2NWExNy45IDE3LjkgMCAwIDEtMS42ODMgNi42NjdBOC4wMDggOC4wMDggMCAwIDAgMTkuOTM4IDEzek00LjA2MiAxMWgzLjk2NUExNy45IDE3LjkgMCAwIDEgOS43MSA0LjMzMyA4LjAwOCA4LjAwOCAwIDAgMCA0LjA2MiAxMXptNS45NjkgMGgzLjkzOEExNS45MDUgMTUuOTA1IDAgMCAwIDEyIDQuMjQ4IDE1LjkwNSAxNS45MDUgMCAwIDAgMTAuMDMgMTF6bTQuMjU5LTYuNjY3QTE3LjkgMTcuOSAwIDAgMSAxNS45NzMgMTFoMy45NjVhOC4wMDggOC4wMDggMCAwIDAtNS42NDgtNi42Njd6IiBmaWxsPSIjMDAwIi8+PC9zdmc+`,
  earth: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDB6Ii8+PHBhdGggZD0iTTYuMjM1IDYuNDUzYTggOCAwIDAgMCA4LjgxNyAxMi45NDRjLjExNS0uNzUtLjEzNy0xLjQ3LS4yNC0xLjcyMi0uMjMtLjU2LS45ODgtMS41MTctMi4yNTMtMi44NDQtLjMzOC0uMzU1LS4zMTYtLjYyOC0uMTk1LTEuNDM3bC4wMTMtLjA5MWMuMDgyLS41NTQuMjItLjg4MiAyLjA4NS0xLjE3OC45NDgtLjE1IDEuMTk3LjIyOCAxLjU0Mi43NTNsLjExNi4xNzJjLjMyOC40OC41NzEuNTkuOTM4Ljc1Ni4xNjUuMDc1LjM3LjE3LjY0NS4zMjUuNjUyLjM3My42NTIuNzk0LjY1MiAxLjcxNnYuMTA1YzAgLjM5MS0uMDM4LjczNS0uMDk4IDEuMDM0YTguMDAyIDguMDAyIDAgMCAwLTMuMTA1LTEyLjM0MWMtLjU1My4zNzMtMS4zMTIuOTAyLTEuNTc3IDEuMjY1LS4xMzUuMTg1LS4zMjcgMS4xMzItLjk1IDEuMjEtLjE2Mi4wMi0uMzgxLjAwNi0uNjEzLS4wMDktLjYyMi0uMDQtMS40NzItLjA5NS0xLjc0NC42NDQtLjE3My40NjgtLjIwMyAxLjc0LjM1NiAyLjQuMDkuMTA1LjEwNy4zLjA0Ni41MTktLjA4LjI4Ny0uMjQxLjQ2Mi0uMjkyLjQ5OC0uMDk2LS4wNTYtLjI4OC0uMjc5LS40MTktLjQzLS4zMTMtLjM2NS0uNzA1LS44Mi0xLjIxMS0uOTYtLjE4NC0uMDUxLS4zODYtLjA5My0uNTgzLS4xMzUtLjU0OS0uMTE1LTEuMTctLjI0Ni0xLjMxNS0uNTU0LS4xMDYtLjIyNi0uMTA1LS41MzctLjEwNS0uODY1IDAtLjQxNyAwLS44ODgtLjIwNC0xLjM0NWExLjI3NiAxLjI3NiAwIDAgMC0uMzA2LS40M3pNMTIgMjJDNi40NzcgMjIgMiAxNy41MjMgMiAxMlM2LjQ3NyAyIDEyIDJzMTAgNC40NzcgMTAgMTAtNC40NzcgMTAtMTAgMTB6IiBmaWxsPSIjMDAwIi8+PC9zdmc+`,
  custom: ``,
};
