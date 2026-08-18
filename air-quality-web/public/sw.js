self.addEventListener("push", (event) => {
  let data = {
    title: "Air Quality Alert",
    body: "Air quality has changed.",
    url: "/",
  };

  if (event.data) {
    try {
      data = {
        ...data,
        ...event.data.json(),
      };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client && client.url.includes(self.location.origin)) {
            client.navigate(url);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
