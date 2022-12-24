import type { CodegenConfig } from '@graphql-codegen/cli'
import { environment } from './environments/environment'
 
const config: CodegenConfig = {
  schema: environment.apiUrl,
  documents: ['app/**/*.graphql'],
  generates: {
    'app/state/gql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-apollo-angular']
    }
  }
}
export default config