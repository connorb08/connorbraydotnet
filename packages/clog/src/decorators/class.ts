const LogClass: ClassDecorator = (target) => {
	console.log(`Class ${target.name} has been decorated`);
};

export { LogClass };
