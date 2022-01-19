import { SessionService } from '@noovolari/leapp-core/services/session/session.service'
import { SessionType } from '@noovolari/leapp-core/models/session-type'
import { AwsIamRoleFederatedService } from '@noovolari/leapp-core/services/session/aws/aws-iam-role-federated-service'
import { AzureService } from '@noovolari/leapp-core/services/session/azure/azure.service'
import { AwsIamUserService } from '@noovolari/leapp-core/services/session/aws/aws-iam-user-service'
import { AwsIamRoleChainedService } from '@noovolari/leapp-core/services/session/aws/aws-iam-role-chained-service'
import { AwsSsoRoleService } from './session/aws/method/aws-sso-role-service'

//TODO: move under core module
export class SessionFactory {
  constructor(
    private readonly awsIamUserService: AwsIamUserService,
    private readonly awsIamRoleFederatedService: AwsIamRoleFederatedService,
    private readonly awsIamRoleChainedService: AwsIamRoleChainedService,
    private readonly awsSsoRoleService: AwsSsoRoleService,
    private readonly azureService: AzureService) {
  }

  getSessionService(accountType: SessionType): SessionService {
    switch (accountType) {
      case SessionType.awsIamUser:
        return this.awsIamUserService
      case SessionType.awsIamRoleFederated:
        return this.awsIamRoleFederatedService
      case SessionType.awsIamRoleChained:
        return this.awsIamRoleChainedService
      case SessionType.awsSsoRole:
        return this.awsSsoRoleService
      case SessionType.azure:
        return this.azureService
    }
  }
}