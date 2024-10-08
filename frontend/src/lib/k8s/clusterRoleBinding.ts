import { apiFactory } from './apiProxy';
import { makeKubeObject } from './cluster';
import { KubeRoleBinding } from './roleBinding';

class ClusterRoleBinding extends makeKubeObject<KubeRoleBinding>('roleBinding') {
  static apiEndpoint = apiFactory('rbac.authorization.k8s.io', 'v1', 'clusterrolebindings');

  static get className(): string {
    return 'ClusterRoleBinding';
  }

  get detailsRoute() {
    return 'clusterRoleBinding';
  }

  get roleRef() {
    return this.jsonData!.roleRef;
  }

  get subjects(): KubeRoleBinding['subjects'] {
    return this.jsonData!.subjects;
  }
}

export default ClusterRoleBinding;
