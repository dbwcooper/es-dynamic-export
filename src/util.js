

  export const actionCreatorFactory = (type, ...argNames) =>
  (...args) => (
    {
        type,
        payload: args[0]
    }
  )
  export const actionsFactory = (actions = [], ns) => {
    const action = {
        actionNames: {
        }
    };
    actions.forEach(key => {
        action.actionNames[key] = key;
        action[key] = actionCreatorFactory(`${ns}/${key}`);
        action[key].model = actionCreatorFactory(key);
    })
    return action;
  };

  const action = {
    name: "tom"
  }