export const Resume = validate10;
const schema11 = {
	$id: "Resume",
	type: "object",
	properties: {
		name: { type: "string" },
		about: {
			type: "object",
			properties: {
				phoneNumber: { type: "string", isNotEmpty: true },
				emailAddress: { type: "string", format: "email" },
				location: { type: "string" },
				languages: { type: "array", items: { type: "string" } },
				technologies: { type: "array", items: { type: "string" } },
				interests: { type: "array", nullable: true, items: { type: "string" } },
			},
			required: ["phoneNumber", "emailAddress", "location"],
			additionalProperties: false,
		},
		education: {
			type: "array",
			items: {
				type: "object",
				required: ["school", "degree", "about"],
				properties: {
					school: { type: "string" },
					degree: { type: "string" },
					location: { type: "string", nullable: true },
					startDate: { type: "string", nullable: true },
					endDate: { type: "string", nullable: true },
					about: { type: "array", items: { type: "string" } },
				},
			},
		},
		career: {
			type: "array",
			items: {
				type: "object",
				required: ["company", "title", "location", "startDate", "about"],
				properties: {
					company: { type: "string" },
					title: { type: "string" },
					location: { type: "string" },
					startDate: { type: "string" },
					about: { type: "array", items: { type: "string" } },
					endDate: { type: "string", nullable: true },
				},
			},
		},
		projects: {
			type: "array",
			items: {
				type: "object",
				required: ["name", "about"],
				properties: {
					name: { type: "string" },
					technologies: { type: "array", items: { type: "string" } },
					about: { type: "array", items: { type: "string" } },
				},
			},
		},
	},
	required: ["name", "about", "education", "career", "projects"],
	additionalProperties: false,
};
const formats0 =
	/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
function validate10(
	data,
	{ instancePath = "", parentData, parentDataProperty, rootData = data } = {},
) {
	/*# sourceURL="Resume" */
	let vErrors = null;
	let errors = 0;
	if (data && typeof data === "object" && !Array.isArray(data)) {
		if (data.name === undefined) {
			const err0 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "name" },
				message: "must have required property '" + "name" + "'",
			};
			if (vErrors === null) {
				vErrors = [err0];
			} else {
				vErrors.push(err0);
			}
			errors++;
		}
		if (data.about === undefined) {
			const err1 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "about" },
				message: "must have required property '" + "about" + "'",
			};
			if (vErrors === null) {
				vErrors = [err1];
			} else {
				vErrors.push(err1);
			}
			errors++;
		}
		if (data.education === undefined) {
			const err2 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "education" },
				message: "must have required property '" + "education" + "'",
			};
			if (vErrors === null) {
				vErrors = [err2];
			} else {
				vErrors.push(err2);
			}
			errors++;
		}
		if (data.career === undefined) {
			const err3 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "career" },
				message: "must have required property '" + "career" + "'",
			};
			if (vErrors === null) {
				vErrors = [err3];
			} else {
				vErrors.push(err3);
			}
			errors++;
		}
		if (data.projects === undefined) {
			const err4 = {
				instancePath,
				schemaPath: "#/required",
				keyword: "required",
				params: { missingProperty: "projects" },
				message: "must have required property '" + "projects" + "'",
			};
			if (vErrors === null) {
				vErrors = [err4];
			} else {
				vErrors.push(err4);
			}
			errors++;
		}
		for (const key0 in data) {
			if (
				!(
					key0 === "name" ||
					key0 === "about" ||
					key0 === "education" ||
					key0 === "career" ||
					key0 === "projects"
				)
			) {
				const err5 = {
					instancePath,
					schemaPath: "#/additionalProperties",
					keyword: "additionalProperties",
					params: { additionalProperty: key0 },
					message: "must NOT have additional properties",
				};
				if (vErrors === null) {
					vErrors = [err5];
				} else {
					vErrors.push(err5);
				}
				errors++;
			}
		}
		if (data.name !== undefined) {
			if (typeof data.name !== "string") {
				const err6 = {
					instancePath: `${instancePath}/name`,
					schemaPath: "#/properties/name/type",
					keyword: "type",
					params: { type: "string" },
					message: "must be string",
				};
				if (vErrors === null) {
					vErrors = [err6];
				} else {
					vErrors.push(err6);
				}
				errors++;
			}
		}
		if (data.about !== undefined) {
			const data1 = data.about;
			if (data1 && typeof data1 === "object" && !Array.isArray(data1)) {
				if (data1.phoneNumber === undefined) {
					const err7 = {
						instancePath: `${instancePath}/about`,
						schemaPath: "#/properties/about/required",
						keyword: "required",
						params: { missingProperty: "phoneNumber" },
						message: "must have required property '" + "phoneNumber" + "'",
					};
					if (vErrors === null) {
						vErrors = [err7];
					} else {
						vErrors.push(err7);
					}
					errors++;
				}
				if (data1.emailAddress === undefined) {
					const err8 = {
						instancePath: `${instancePath}/about`,
						schemaPath: "#/properties/about/required",
						keyword: "required",
						params: { missingProperty: "emailAddress" },
						message: "must have required property '" + "emailAddress" + "'",
					};
					if (vErrors === null) {
						vErrors = [err8];
					} else {
						vErrors.push(err8);
					}
					errors++;
				}
				if (data1.location === undefined) {
					const err9 = {
						instancePath: `${instancePath}/about`,
						schemaPath: "#/properties/about/required",
						keyword: "required",
						params: { missingProperty: "location" },
						message: "must have required property '" + "location" + "'",
					};
					if (vErrors === null) {
						vErrors = [err9];
					} else {
						vErrors.push(err9);
					}
					errors++;
				}
				for (const key1 in data1) {
					if (
						!(
							key1 === "phoneNumber" ||
							key1 === "emailAddress" ||
							key1 === "location" ||
							key1 === "languages" ||
							key1 === "technologies" ||
							key1 === "interests"
						)
					) {
						const err10 = {
							instancePath: `${instancePath}/about`,
							schemaPath: "#/properties/about/additionalProperties",
							keyword: "additionalProperties",
							params: { additionalProperty: key1 },
							message: "must NOT have additional properties",
						};
						if (vErrors === null) {
							vErrors = [err10];
						} else {
							vErrors.push(err10);
						}
						errors++;
					}
				}
				if (data1.phoneNumber !== undefined) {
					const data2 = data1.phoneNumber;
					if (typeof data2 === "string") {
						if (typeof data2 === "string" && data2.trim() === "") {
							const err11 = {
								instancePath: `${instancePath}/about/phoneNumber`,
								schemaPath:
									"#/properties/about/properties/phoneNumber/isNotEmpty",
								keyword: "isNotEmpty",
								params: {},
								message: 'must pass "isNotEmpty" keyword validation',
							};
							if (vErrors === null) {
								vErrors = [err11];
							} else {
								vErrors.push(err11);
							}
							errors++;
						}
					} else {
						const err12 = {
							instancePath: `${instancePath}/about/phoneNumber`,
							schemaPath: "#/properties/about/properties/phoneNumber/type",
							keyword: "type",
							params: { type: "string" },
							message: "must be string",
						};
						if (vErrors === null) {
							vErrors = [err12];
						} else {
							vErrors.push(err12);
						}
						errors++;
					}
				}
				if (data1.emailAddress !== undefined) {
					const data3 = data1.emailAddress;
					if (typeof data3 === "string") {
						if (!formats0.test(data3)) {
							const err13 = {
								instancePath: `${instancePath}/about/emailAddress`,
								schemaPath: "#/properties/about/properties/emailAddress/format",
								keyword: "format",
								params: { format: "email" },
								message: 'must match format "' + "email" + '"',
							};
							if (vErrors === null) {
								vErrors = [err13];
							} else {
								vErrors.push(err13);
							}
							errors++;
						}
					} else {
						const err14 = {
							instancePath: `${instancePath}/about/emailAddress`,
							schemaPath: "#/properties/about/properties/emailAddress/type",
							keyword: "type",
							params: { type: "string" },
							message: "must be string",
						};
						if (vErrors === null) {
							vErrors = [err14];
						} else {
							vErrors.push(err14);
						}
						errors++;
					}
				}
				if (data1.location !== undefined) {
					if (typeof data1.location !== "string") {
						const err15 = {
							instancePath: `${instancePath}/about/location`,
							schemaPath: "#/properties/about/properties/location/type",
							keyword: "type",
							params: { type: "string" },
							message: "must be string",
						};
						if (vErrors === null) {
							vErrors = [err15];
						} else {
							vErrors.push(err15);
						}
						errors++;
					}
				}
				if (data1.languages !== undefined) {
					const data5 = data1.languages;
					if (Array.isArray(data5)) {
						const len0 = data5.length;
						for (let i0 = 0; i0 < len0; i0++) {
							if (typeof data5[i0] !== "string") {
								const err16 = {
									instancePath: `${instancePath}/about/languages/${i0}`,
									schemaPath:
										"#/properties/about/properties/languages/items/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err16];
								} else {
									vErrors.push(err16);
								}
								errors++;
							}
						}
					} else {
						const err17 = {
							instancePath: `${instancePath}/about/languages`,
							schemaPath: "#/properties/about/properties/languages/type",
							keyword: "type",
							params: { type: "array" },
							message: "must be array",
						};
						if (vErrors === null) {
							vErrors = [err17];
						} else {
							vErrors.push(err17);
						}
						errors++;
					}
				}
				if (data1.technologies !== undefined) {
					const data7 = data1.technologies;
					if (Array.isArray(data7)) {
						const len1 = data7.length;
						for (let i1 = 0; i1 < len1; i1++) {
							if (typeof data7[i1] !== "string") {
								const err18 = {
									instancePath: `${instancePath}/about/technologies/${i1}`,
									schemaPath:
										"#/properties/about/properties/technologies/items/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err18];
								} else {
									vErrors.push(err18);
								}
								errors++;
							}
						}
					} else {
						const err19 = {
							instancePath: `${instancePath}/about/technologies`,
							schemaPath: "#/properties/about/properties/technologies/type",
							keyword: "type",
							params: { type: "array" },
							message: "must be array",
						};
						if (vErrors === null) {
							vErrors = [err19];
						} else {
							vErrors.push(err19);
						}
						errors++;
					}
				}
				if (data1.interests !== undefined) {
					const data9 = data1.interests;
					if (!Array.isArray(data9) && data9 !== null) {
						const err20 = {
							instancePath: `${instancePath}/about/interests`,
							schemaPath: "#/properties/about/properties/interests/type",
							keyword: "type",
							params: { type: "array" },
							message: "must be array",
						};
						if (vErrors === null) {
							vErrors = [err20];
						} else {
							vErrors.push(err20);
						}
						errors++;
					}
					if (Array.isArray(data9)) {
						const len2 = data9.length;
						for (let i2 = 0; i2 < len2; i2++) {
							if (typeof data9[i2] !== "string") {
								const err21 = {
									instancePath: `${instancePath}/about/interests/${i2}`,
									schemaPath:
										"#/properties/about/properties/interests/items/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err21];
								} else {
									vErrors.push(err21);
								}
								errors++;
							}
						}
					}
				}
			} else {
				const err22 = {
					instancePath: `${instancePath}/about`,
					schemaPath: "#/properties/about/type",
					keyword: "type",
					params: { type: "object" },
					message: "must be object",
				};
				if (vErrors === null) {
					vErrors = [err22];
				} else {
					vErrors.push(err22);
				}
				errors++;
			}
		}
		if (data.education !== undefined) {
			const data11 = data.education;
			if (Array.isArray(data11)) {
				const len3 = data11.length;
				for (let i3 = 0; i3 < len3; i3++) {
					const data12 = data11[i3];
					if (data12 && typeof data12 === "object" && !Array.isArray(data12)) {
						if (data12.school === undefined) {
							const err23 = {
								instancePath: `${instancePath}/education/${i3}`,
								schemaPath: "#/properties/education/items/required",
								keyword: "required",
								params: { missingProperty: "school" },
								message: "must have required property '" + "school" + "'",
							};
							if (vErrors === null) {
								vErrors = [err23];
							} else {
								vErrors.push(err23);
							}
							errors++;
						}
						if (data12.degree === undefined) {
							const err24 = {
								instancePath: `${instancePath}/education/${i3}`,
								schemaPath: "#/properties/education/items/required",
								keyword: "required",
								params: { missingProperty: "degree" },
								message: "must have required property '" + "degree" + "'",
							};
							if (vErrors === null) {
								vErrors = [err24];
							} else {
								vErrors.push(err24);
							}
							errors++;
						}
						if (data12.about === undefined) {
							const err25 = {
								instancePath: `${instancePath}/education/${i3}`,
								schemaPath: "#/properties/education/items/required",
								keyword: "required",
								params: { missingProperty: "about" },
								message: "must have required property '" + "about" + "'",
							};
							if (vErrors === null) {
								vErrors = [err25];
							} else {
								vErrors.push(err25);
							}
							errors++;
						}
						if (data12.school !== undefined) {
							if (typeof data12.school !== "string") {
								const err26 = {
									instancePath: `${instancePath}/education/${i3}/school`,
									schemaPath:
										"#/properties/education/items/properties/school/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err26];
								} else {
									vErrors.push(err26);
								}
								errors++;
							}
						}
						if (data12.degree !== undefined) {
							if (typeof data12.degree !== "string") {
								const err27 = {
									instancePath: `${instancePath}/education/${i3}/degree`,
									schemaPath:
										"#/properties/education/items/properties/degree/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err27];
								} else {
									vErrors.push(err27);
								}
								errors++;
							}
						}
						if (data12.location !== undefined) {
							const data15 = data12.location;
							if (typeof data15 !== "string" && data15 !== null) {
								const err28 = {
									instancePath: `${instancePath}/education/${i3}/location`,
									schemaPath:
										"#/properties/education/items/properties/location/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err28];
								} else {
									vErrors.push(err28);
								}
								errors++;
							}
						}
						if (data12.startDate !== undefined) {
							const data16 = data12.startDate;
							if (typeof data16 !== "string" && data16 !== null) {
								const err29 = {
									instancePath: `${instancePath}/education/${i3}/startDate`,
									schemaPath:
										"#/properties/education/items/properties/startDate/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err29];
								} else {
									vErrors.push(err29);
								}
								errors++;
							}
						}
						if (data12.endDate !== undefined) {
							const data17 = data12.endDate;
							if (typeof data17 !== "string" && data17 !== null) {
								const err30 = {
									instancePath: `${instancePath}/education/${i3}/endDate`,
									schemaPath:
										"#/properties/education/items/properties/endDate/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err30];
								} else {
									vErrors.push(err30);
								}
								errors++;
							}
						}
						if (data12.about !== undefined) {
							const data18 = data12.about;
							if (Array.isArray(data18)) {
								const len4 = data18.length;
								for (let i4 = 0; i4 < len4; i4++) {
									if (typeof data18[i4] !== "string") {
										const err31 = {
											instancePath: `${instancePath}/education/${i3}/about/${i4}`,
											schemaPath:
												"#/properties/education/items/properties/about/items/type",
											keyword: "type",
											params: { type: "string" },
											message: "must be string",
										};
										if (vErrors === null) {
											vErrors = [err31];
										} else {
											vErrors.push(err31);
										}
										errors++;
									}
								}
							} else {
								const err32 = {
									instancePath: `${instancePath}/education/${i3}/about`,
									schemaPath:
										"#/properties/education/items/properties/about/type",
									keyword: "type",
									params: { type: "array" },
									message: "must be array",
								};
								if (vErrors === null) {
									vErrors = [err32];
								} else {
									vErrors.push(err32);
								}
								errors++;
							}
						}
					} else {
						const err33 = {
							instancePath: `${instancePath}/education/${i3}`,
							schemaPath: "#/properties/education/items/type",
							keyword: "type",
							params: { type: "object" },
							message: "must be object",
						};
						if (vErrors === null) {
							vErrors = [err33];
						} else {
							vErrors.push(err33);
						}
						errors++;
					}
				}
			} else {
				const err34 = {
					instancePath: `${instancePath}/education`,
					schemaPath: "#/properties/education/type",
					keyword: "type",
					params: { type: "array" },
					message: "must be array",
				};
				if (vErrors === null) {
					vErrors = [err34];
				} else {
					vErrors.push(err34);
				}
				errors++;
			}
		}
		if (data.career !== undefined) {
			const data20 = data.career;
			if (Array.isArray(data20)) {
				const len5 = data20.length;
				for (let i5 = 0; i5 < len5; i5++) {
					const data21 = data20[i5];
					if (data21 && typeof data21 === "object" && !Array.isArray(data21)) {
						if (data21.company === undefined) {
							const err35 = {
								instancePath: `${instancePath}/career/${i5}`,
								schemaPath: "#/properties/career/items/required",
								keyword: "required",
								params: { missingProperty: "company" },
								message: "must have required property '" + "company" + "'",
							};
							if (vErrors === null) {
								vErrors = [err35];
							} else {
								vErrors.push(err35);
							}
							errors++;
						}
						if (data21.title === undefined) {
							const err36 = {
								instancePath: `${instancePath}/career/${i5}`,
								schemaPath: "#/properties/career/items/required",
								keyword: "required",
								params: { missingProperty: "title" },
								message: "must have required property '" + "title" + "'",
							};
							if (vErrors === null) {
								vErrors = [err36];
							} else {
								vErrors.push(err36);
							}
							errors++;
						}
						if (data21.location === undefined) {
							const err37 = {
								instancePath: `${instancePath}/career/${i5}`,
								schemaPath: "#/properties/career/items/required",
								keyword: "required",
								params: { missingProperty: "location" },
								message: "must have required property '" + "location" + "'",
							};
							if (vErrors === null) {
								vErrors = [err37];
							} else {
								vErrors.push(err37);
							}
							errors++;
						}
						if (data21.startDate === undefined) {
							const err38 = {
								instancePath: `${instancePath}/career/${i5}`,
								schemaPath: "#/properties/career/items/required",
								keyword: "required",
								params: { missingProperty: "startDate" },
								message: "must have required property '" + "startDate" + "'",
							};
							if (vErrors === null) {
								vErrors = [err38];
							} else {
								vErrors.push(err38);
							}
							errors++;
						}
						if (data21.about === undefined) {
							const err39 = {
								instancePath: `${instancePath}/career/${i5}`,
								schemaPath: "#/properties/career/items/required",
								keyword: "required",
								params: { missingProperty: "about" },
								message: "must have required property '" + "about" + "'",
							};
							if (vErrors === null) {
								vErrors = [err39];
							} else {
								vErrors.push(err39);
							}
							errors++;
						}
						if (data21.company !== undefined) {
							if (typeof data21.company !== "string") {
								const err40 = {
									instancePath: `${instancePath}/career/${i5}/company`,
									schemaPath:
										"#/properties/career/items/properties/company/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err40];
								} else {
									vErrors.push(err40);
								}
								errors++;
							}
						}
						if (data21.title !== undefined) {
							if (typeof data21.title !== "string") {
								const err41 = {
									instancePath: `${instancePath}/career/${i5}/title`,
									schemaPath: "#/properties/career/items/properties/title/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err41];
								} else {
									vErrors.push(err41);
								}
								errors++;
							}
						}
						if (data21.location !== undefined) {
							if (typeof data21.location !== "string") {
								const err42 = {
									instancePath: `${instancePath}/career/${i5}/location`,
									schemaPath:
										"#/properties/career/items/properties/location/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err42];
								} else {
									vErrors.push(err42);
								}
								errors++;
							}
						}
						if (data21.startDate !== undefined) {
							if (typeof data21.startDate !== "string") {
								const err43 = {
									instancePath: `${instancePath}/career/${i5}/startDate`,
									schemaPath:
										"#/properties/career/items/properties/startDate/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err43];
								} else {
									vErrors.push(err43);
								}
								errors++;
							}
						}
						if (data21.about !== undefined) {
							const data26 = data21.about;
							if (Array.isArray(data26)) {
								const len6 = data26.length;
								for (let i6 = 0; i6 < len6; i6++) {
									if (typeof data26[i6] !== "string") {
										const err44 = {
											instancePath: `${instancePath}/career/${i5}/about/${i6}`,
											schemaPath:
												"#/properties/career/items/properties/about/items/type",
											keyword: "type",
											params: { type: "string" },
											message: "must be string",
										};
										if (vErrors === null) {
											vErrors = [err44];
										} else {
											vErrors.push(err44);
										}
										errors++;
									}
								}
							} else {
								const err45 = {
									instancePath: `${instancePath}/career/${i5}/about`,
									schemaPath: "#/properties/career/items/properties/about/type",
									keyword: "type",
									params: { type: "array" },
									message: "must be array",
								};
								if (vErrors === null) {
									vErrors = [err45];
								} else {
									vErrors.push(err45);
								}
								errors++;
							}
						}
						if (data21.endDate !== undefined) {
							const data28 = data21.endDate;
							if (typeof data28 !== "string" && data28 !== null) {
								const err46 = {
									instancePath: `${instancePath}/career/${i5}/endDate`,
									schemaPath:
										"#/properties/career/items/properties/endDate/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err46];
								} else {
									vErrors.push(err46);
								}
								errors++;
							}
						}
					} else {
						const err47 = {
							instancePath: `${instancePath}/career/${i5}`,
							schemaPath: "#/properties/career/items/type",
							keyword: "type",
							params: { type: "object" },
							message: "must be object",
						};
						if (vErrors === null) {
							vErrors = [err47];
						} else {
							vErrors.push(err47);
						}
						errors++;
					}
				}
			} else {
				const err48 = {
					instancePath: `${instancePath}/career`,
					schemaPath: "#/properties/career/type",
					keyword: "type",
					params: { type: "array" },
					message: "must be array",
				};
				if (vErrors === null) {
					vErrors = [err48];
				} else {
					vErrors.push(err48);
				}
				errors++;
			}
		}
		if (data.projects !== undefined) {
			const data29 = data.projects;
			if (Array.isArray(data29)) {
				const len7 = data29.length;
				for (let i7 = 0; i7 < len7; i7++) {
					const data30 = data29[i7];
					if (data30 && typeof data30 === "object" && !Array.isArray(data30)) {
						if (data30.name === undefined) {
							const err49 = {
								instancePath: `${instancePath}/projects/${i7}`,
								schemaPath: "#/properties/projects/items/required",
								keyword: "required",
								params: { missingProperty: "name" },
								message: "must have required property '" + "name" + "'",
							};
							if (vErrors === null) {
								vErrors = [err49];
							} else {
								vErrors.push(err49);
							}
							errors++;
						}
						if (data30.about === undefined) {
							const err50 = {
								instancePath: `${instancePath}/projects/${i7}`,
								schemaPath: "#/properties/projects/items/required",
								keyword: "required",
								params: { missingProperty: "about" },
								message: "must have required property '" + "about" + "'",
							};
							if (vErrors === null) {
								vErrors = [err50];
							} else {
								vErrors.push(err50);
							}
							errors++;
						}
						if (data30.name !== undefined) {
							if (typeof data30.name !== "string") {
								const err51 = {
									instancePath: `${instancePath}/projects/${i7}/name`,
									schemaPath:
										"#/properties/projects/items/properties/name/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string",
								};
								if (vErrors === null) {
									vErrors = [err51];
								} else {
									vErrors.push(err51);
								}
								errors++;
							}
						}
						if (data30.technologies !== undefined) {
							const data32 = data30.technologies;
							if (Array.isArray(data32)) {
								const len8 = data32.length;
								for (let i8 = 0; i8 < len8; i8++) {
									if (typeof data32[i8] !== "string") {
										const err52 = {
											instancePath: `${instancePath}/projects/${i7}/technologies/${i8}`,
											schemaPath:
												"#/properties/projects/items/properties/technologies/items/type",
											keyword: "type",
											params: { type: "string" },
											message: "must be string",
										};
										if (vErrors === null) {
											vErrors = [err52];
										} else {
											vErrors.push(err52);
										}
										errors++;
									}
								}
							} else {
								const err53 = {
									instancePath: `${instancePath}/projects/${i7}/technologies`,
									schemaPath:
										"#/properties/projects/items/properties/technologies/type",
									keyword: "type",
									params: { type: "array" },
									message: "must be array",
								};
								if (vErrors === null) {
									vErrors = [err53];
								} else {
									vErrors.push(err53);
								}
								errors++;
							}
						}
						if (data30.about !== undefined) {
							const data34 = data30.about;
							if (Array.isArray(data34)) {
								const len9 = data34.length;
								for (let i9 = 0; i9 < len9; i9++) {
									if (typeof data34[i9] !== "string") {
										const err54 = {
											instancePath: `${instancePath}/projects/${i7}/about/${i9}`,
											schemaPath:
												"#/properties/projects/items/properties/about/items/type",
											keyword: "type",
											params: { type: "string" },
											message: "must be string",
										};
										if (vErrors === null) {
											vErrors = [err54];
										} else {
											vErrors.push(err54);
										}
										errors++;
									}
								}
							} else {
								const err55 = {
									instancePath: `${instancePath}/projects/${i7}/about`,
									schemaPath:
										"#/properties/projects/items/properties/about/type",
									keyword: "type",
									params: { type: "array" },
									message: "must be array",
								};
								if (vErrors === null) {
									vErrors = [err55];
								} else {
									vErrors.push(err55);
								}
								errors++;
							}
						}
					} else {
						const err56 = {
							instancePath: `${instancePath}/projects/${i7}`,
							schemaPath: "#/properties/projects/items/type",
							keyword: "type",
							params: { type: "object" },
							message: "must be object",
						};
						if (vErrors === null) {
							vErrors = [err56];
						} else {
							vErrors.push(err56);
						}
						errors++;
					}
				}
			} else {
				const err57 = {
					instancePath: `${instancePath}/projects`,
					schemaPath: "#/properties/projects/type",
					keyword: "type",
					params: { type: "array" },
					message: "must be array",
				};
				if (vErrors === null) {
					vErrors = [err57];
				} else {
					vErrors.push(err57);
				}
				errors++;
			}
		}
	} else {
		const err58 = {
			instancePath,
			schemaPath: "#/type",
			keyword: "type",
			params: { type: "object" },
			message: "must be object",
		};
		if (vErrors === null) {
			vErrors = [err58];
		} else {
			vErrors.push(err58);
		}
		errors++;
	}
	validate10.errors = vErrors;
	return errors === 0;
}
