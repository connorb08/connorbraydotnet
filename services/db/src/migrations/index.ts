export const migrationLoaders = {
	"0000_create_database": () => import("./0000_create_database"),
	"0001_seed_database": () => import("./0001_seed_database"),
};
