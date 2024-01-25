import { H3Event } from 'h3';
import { getContext, getTenantId } from '@antify/context';
import { Client } from '../client/Client';
import { getDatabaseClient } from '../utils';
import { SingleConnectionClient } from '../client/SingleConnectionClient';
import { MultiConnectionClient } from '../client/MultiConnectionClient';

export const getDatabaseClientFromRequest = async (
  event: H3Event,
  // TODO:: find a propper way to extend schemas. Global registry etc?
  extendSchemaCb?: (client: Client) => void
) => {
  const context = getContext(event);
  const client = getDatabaseClient(context.id);

  if (context.isSingleTenancy) {
    await (client as SingleConnectionClient).connect();
  } else {
    const tenantId = getTenantId(event);

    if (!tenantId) {
      throw Error(
        `Context error: Missing required tenantId for multi tenancy context`
      );
    }

    await (client as MultiConnectionClient).connect(tenantId);
  }

  if (extendSchemaCb) {
    extendSchemaCb(client);
  }

  return client;
};
