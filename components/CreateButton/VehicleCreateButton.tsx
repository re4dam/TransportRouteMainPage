'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function VehicleCreateButton() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		const checkLoginState = localStorage.getItem('isLoggedIn') === 'true';
		setIsLoggedIn(checkLoginState);
	}, []);

	if (!isLoggedIn) return null;

	return (
		<Link
			href="/vehicles/create"
			className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 whitespace-nowrap"
		>
			<span className="mr-2">+</span> Create Vehicles
		</Link>
	);
}
