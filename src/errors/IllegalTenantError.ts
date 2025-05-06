export class IllegalTenantError extends Error {
    constructor(illegalTenantId: string) {
        super(`Illegal tenant. Tenant with id "${illegalTenantId}" does not exists.`);
        this.name = 'IllegalTenantError';

        Object.setPrototypeOf(this, IllegalTenantError.prototype);
    }
}
