export function trackEvent(eventName: string, props?: Record<string, string | number | boolean>) {
    if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible(eventName, { props });
    } else {
        console.log("Plausible event tracked (dev):", eventName, props);
    }
}
