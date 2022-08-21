import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

const baseTypeNames = ['String', 'Number', 'Boolean'];

export const ApiOk = <TModel extends Type<any>>(
  model?: TModel,
  isArray = false,
) => {
  let items = null;
  if (model && baseTypeNames.includes(model.name)) {
    items = { type: model.name.toLocaleLowerCase() };
  } else {
    items = { $ref: getSchemaPath(model) };
  }
  let prop = null;
  if (isArray) {
    prop = {
      type: 'array',
      items,
    };
  } else if (model) {
    prop = items;
  } else {
    prop = { type: 'null', default: null };
  }
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              code: {
                type: 'number',
                default: 0,
              },
              message: {
                type: 'string',
                default: 'success',
              },
              data: prop,
            },
          },
        ],
      },
    }),
  );
};
