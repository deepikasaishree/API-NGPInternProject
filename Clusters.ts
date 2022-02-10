export default class ClusterDomain {
    private readonly is_readonly: any
    private readonly last_queue_update: any
    private readonly absolute_delay: any
    private readonly active_replicas: any
    private readonly zookeeper_exception: any
    private readonly table_size: any

    constructor(is_readonly: any, last_queue_update: any, absolute_delay: any, active_replicas: any, zookeeper_exception: any, table_size: any){
        this.is_readonly = is_readonly
        this.last_queue_update = last_queue_update
        this.absolute_delay = absolute_delay
        this.active_replicas = active_replicas
        this.zookeeper_exception = zookeeper_exception
        this.table_size = table_size
    }

    public static createFromJson({ is_readonly, last_queue_update, absolute_delay, active_replicas, zookeeper_exception, table_size }) {
        return new ClusterDomain(is_readonly, last_queue_update, absolute_delay, active_replicas, zookeeper_exception, table_size)
      }
    
      public asJson() {
        return {
          is_readonly: this.is_readonly,
          last_queue_update: this.last_queue_update,
          absolute_delay: this.absolute_delay,
          active_replicas: this.active_replicas,
          zookeeper_exception: this.zookeeper_exception,
          table_size: this.table_size
        }
      }
}