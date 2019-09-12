export const Identifiers: Record<string, symbol> = {
    // Config
    ConfigFlags: Symbol.for("Config<Flags>"),
    ConfigPlugins: Symbol.for("Config<Plugins>"),
    // Application
    Application: Symbol.for("Application<Instance>"),
    ApplicationDirPrefix: Symbol.for("Application<DirPrefix>"),
    ApplicationEnvironment: Symbol.for("Application<Environment>"),
    ApplicationNamespace: Symbol.for("Application<Namespace>"),
    ApplicationNetwork: Symbol.for("Application<Network>"),
    ApplicationToken: Symbol.for("Application<Token>"),
    ApplicationVersion: Symbol.for("Application<Version>"),
    // Crypto
    Crypto: Symbol.for("Crypto<NetworkConfig>"),
    // Managers
    CacheManager: Symbol.for("Manager<Cache>"),
    ConfigManager: Symbol.for("Manager<Config>"),
    DatabaseManager: Symbol.for("Manager<Database>"),
    EventDispatcherManager: Symbol.for("Manager<EventDispatcher>"),
    FilesystemManager: Symbol.for("Manager<Filesystem>"),
    LogManager: Symbol.for("Manager<Log>"),
    QueueManager: Symbol.for("Manager<Queue>"),
    ValidationManager: Symbol.for("Manager<Validation>"),
    // Services
    ActionService: Symbol.for("Service<Actions>"),
    AttributeService: Symbol.for("Service<Attribute>"),
    BlockchainService: Symbol.for("Service<Blockchain>"),
    CacheService: Symbol.for("Service<Cache>"),
    ConfigService: Symbol.for("Service<Config>"),
    DatabaseService: Symbol.for("Service<Database>"),
    EventDispatcherService: Symbol.for("Service<EventDispatcher>"),
    FilesystemService: Symbol.for("Service<Filesystem>"),
    LogService: Symbol.for("Service<Log>"),
    MixinService: Symbol.for("Service<Mixin>"),
    PeerService: Symbol.for("Service<P2P>"),
    QueueService: Symbol.for("Service<Queue>"),
    ScheduleService: Symbol.for("Service<Schedule>"),
    SnapshotService: Symbol.for("Service<Snapshot>"),
    StateService: Symbol.for("Service<State>"),
    TransactionPoolService: Symbol.for("Service<TransactionPool>"),
    ValidationService: Symbol.for("Service<Validation>"),
    // Repositories
    ConfigRepository: Symbol.for("Repository<Config>"),
    ServiceProviderRepository: Symbol.for("Repository<ServiceProvider>"),
};
